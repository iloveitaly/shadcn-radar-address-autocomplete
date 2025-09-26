import * as React from "react"
import { Command as CommandPrimitive } from "cmdk"
import Radar from "radar-sdk-js"
import {
  useCallback,
  useEffect,
  useImperativeHandle,
  useMemo,
  useReducer,
  useRef,
  useState,
} from "react"

import { MapPin, SearchIcon, X } from "lucide-react"

import { log } from "~/configuration/logging"
import { cn } from "~/lib/utils"
import { debounce } from "~/lib/utils"

import { Command, CommandItem, CommandList } from "./ui/command"
import type { RadarAddress } from "radar-sdk-js/dist/types"

interface GeolocationAutocompleteProps {
  apiKey: string
  onAddressSelect: (address: RadarAddress | null) => void
  initialValue?: string | null
  placeholder?: string
  disabled?: boolean
  className?: string
  autoFocus?: boolean
  maxResults?: number
  debounceMs?: number
  // you can throw an error here if something goes wrong, a generic error message will be shown to the user
  customFetchAddresses?: (
    query: string,
    limit: number,
  ) => Promise<RadarAddress[]>
}

interface GeolocationAutocompleteHandle {
  triggerSearch: () => Promise<void>
}

function SearchCommandInput({
  className,
  ...props
}: React.ComponentProps<typeof CommandPrimitive.Input>) {
  return (
    <div
      data-slot="command-input-wrapper"
      className="flex h-9 items-center gap-2 px-3"
    >
      <SearchIcon className="size-4 shrink-0 opacity-50" />
      <CommandPrimitive.Input
        data-slot="command-input"
        className={cn(
          "placeholder:text-muted-foreground flex h-10 w-full rounded-md bg-transparent py-3 text-sm outline-hidden disabled:cursor-not-allowed disabled:opacity-50",
          className,
        )}
        {...props}
      />
    </div>
  )
}

type State = {
  isOpen: boolean
  results: RadarAddress[]
  isLoading: boolean
  error: string | null
}

type Action =
  | { type: "START_SEARCH" }
  | { type: "SEARCH_SUCCESS"; results: RadarAddress[] }
  | { type: "SEARCH_ERROR"; error: string }
  | { type: "CLEAR_RESULTS" }
  | { type: "CLOSE_DROPDOWN" }

const initialState: State = {
  isOpen: false,
  results: [],
  isLoading: false,
  error: null,
}

function reducer(state: State, action: Action): State {
  switch (action.type) {
    case "START_SEARCH":
      return { ...state, isLoading: true, error: null }
    case "SEARCH_SUCCESS":
      return {
        ...state,
        isLoading: false,
        results: action.results,
        isOpen: true,
      }
    case "SEARCH_ERROR":
      return { ...state, isLoading: false, error: action.error, results: [] }
    case "CLEAR_RESULTS":
      return { ...state, results: [], isLoading: false }
    case "CLOSE_DROPDOWN":
      if (!state.isOpen) return state
      return { ...state, isOpen: false }
    default:
      return state
  }
}

const GeolocationAutocomplete = React.forwardRef<
  GeolocationAutocompleteHandle,
  GeolocationAutocompleteProps
>(
  (
    {
      apiKey,
      onAddressSelect,
      initialValue = "",
      placeholder = "Search address...",
      disabled = false,
      className,
      autoFocus = false,
      maxResults = 8,
      debounceMs = 300,
      customFetchAddresses,
    },
    ref,
  ) => {
    const inputRef = useRef<HTMLInputElement>(null)
    const listRef = useRef<HTMLDivElement>(null)
    const blurTimeoutRef = useRef<NodeJS.Timeout | null>(null)
    const customFetchRef = useRef<
      ((query: string, limit: number) => Promise<RadarAddress[]>) | undefined
    >(customFetchAddresses)

    const [state, dispatch] = useReducer(reducer, initialState)
    const { isOpen, results, isLoading, error } = state

    const [inputValue, setInputValue] = useState(initialValue || "")
    const [isFocused, setIsFocused] = useState(false)
    const [geolocationSupported, setGeolocationSupported] = useState(true)

    useEffect(() => {
      if (apiKey) {
        log.info("Radar SDK initializing")
        Radar.initialize(apiKey)
      }
    }, [apiKey])

    useEffect(() => {
      if (autoFocus && inputRef.current) {
        inputRef.current.focus()
      }
    }, [autoFocus])

    useEffect(() => {
      setGeolocationSupported(!!navigator.geolocation)
    }, [])

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (blurTimeoutRef.current) {
          clearTimeout(blurTimeoutRef.current)
        }
      }
    }, [])

    // Keep the latest custom fetch function without destabilizing dependencies
    useEffect(() => {
      customFetchRef.current = customFetchAddresses
    }, [customFetchAddresses])

    const closeDropdown = useCallback(() => {
      dispatch({ type: "CLOSE_DROPDOWN" })
    }, [])

    const resolveAddresses = async (
      query: string,
      limit: number,
    ): Promise<RadarAddress[]> => {
      if (!query) return []

      if (customFetchRef.current) {
        return await customFetchRef.current(query, limit)
      }

      const { addresses } = await Radar.autocomplete({
        query,
        countryCode: "US",
        limit,
      })
      return addresses
    }

    const performSearch = useCallback(
      async (value: string) => {
        if (value.length > 2) {
          dispatch({ type: "START_SEARCH" })
          try {
            const addresses = await resolveAddresses(value, maxResults)
            log.info("Radar geocode results", { addresses })
            dispatch({ type: "SEARCH_SUCCESS", results: addresses })
          } catch (err) {
            log.error("Radar geocode error", { err })
            dispatch({
              type: "SEARCH_ERROR",
              error: "Could not fetch address suggestions.",
            })
          }
        } else {
          dispatch({ type: "CLEAR_RESULTS" })
          closeDropdown()
        }
      },
      [maxResults, closeDropdown],
    )

    const debouncedSearch = useMemo(
      () => debounce(performSearch, debounceMs),
      [performSearch, debounceMs],
    )

    const handleInputChange = (value: string) => {
      setInputValue(value)
      debouncedSearch(value)
    }

    const handleSelect = (address: RadarAddress) => {
      log.info("address selected", { address })

      // Clear any pending blur timeout
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }

      setInputValue(address.formattedAddress)
      onAddressSelect(address)
      closeDropdown()
      dispatch({ type: "CLEAR_RESULTS" })
    }

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
      if (e.key !== "Enter") return

      // if a command item is actively highlighted (keyboard navigation), let cmdk handle it
      const hasActiveSelection = !!listRef.current?.querySelector(
        '[data-slot="command-item"][data-selected="true"], [cmdk-item][data-selected="true"], [role="option"][aria-selected="true"]',
      )

      if (hasActiveSelection) return

      if (results.length > 0) {
        e.preventDefault()
        handleSelect(results[0])
      }
    }

    const handleFocus = () => {
      // Clear any pending blur timeout when refocusing
      if (blurTimeoutRef.current) {
        clearTimeout(blurTimeoutRef.current)
        blurTimeoutRef.current = null
      }
      setIsFocused(true)
    }

    const handleBlur = () => {
      setIsFocused(false)

      // Delay closing the dropdown to allow click events to be processed
      blurTimeoutRef.current = setTimeout(() => {
        closeDropdown()
      }, 150)
    }

    const triggerSearch = async () => {
      if (!inputValue) return
      log.info("Triggering search for", { inputValue })
      dispatch({ type: "START_SEARCH" })
      try {
        const addresses = await resolveAddresses(inputValue, maxResults)
        if (addresses.length > 0) {
          handleSelect(addresses[0])
        } else {
          dispatch({
            type: "SEARCH_ERROR",
            error: "No results found for this address.",
          })
        }
      } catch (err) {
        log.error("Radar manual search error", { err })
        dispatch({
          type: "SEARCH_ERROR",
          error: "An error occurred during the search.",
        })
      }
    }

    useImperativeHandle(ref, () => ({
      triggerSearch,
    }))

    const handleClear = () => {
      if (inputValue) {
        onAddressSelect(null)
      }
      setInputValue("")
      dispatch({ type: "CLEAR_RESULTS" })
      closeDropdown()
    }

    const handleGetCurrentLocation = useCallback(async () => {
      if (!navigator.geolocation) {
        dispatch({
          type: "SEARCH_ERROR",
          error: "Geolocation is not supported by this browser.",
        })
        return
      }

      try {
        const position = await new Promise<GeolocationPosition>(
          (resolve, reject) => {
            navigator.geolocation.getCurrentPosition(resolve, reject)
          },
        )

        const { latitude, longitude } = position.coords
        const { addresses } = await Radar.reverseGeocode({
          latitude,
          longitude,
        })

        if (addresses.length > 0) {
          const address = addresses[0]
          setInputValue(address.formattedAddress)
          onAddressSelect(address)
          closeDropdown()
          dispatch({ type: "CLEAR_RESULTS" })
        } else {
          dispatch({
            type: "SEARCH_ERROR",
            error: "No address found for current location.",
          })
        }
      } catch (err) {
        let errorMessage = "Unable to retrieve your location."
        if (err instanceof GeolocationPositionError) {
          switch (err.code) {
            case err.PERMISSION_DENIED:
              errorMessage =
                "Location access denied. Please enable location services."
              break
            case err.POSITION_UNAVAILABLE:
              errorMessage = "Location information is unavailable."
              break
            case err.TIMEOUT:
              errorMessage = "The request to get user location timed out."
              break
          }
        }
        dispatch({ type: "SEARCH_ERROR", error: errorMessage })
      }
    }, [onAddressSelect, closeDropdown])

    return (
      <div className={cn("relative w-full", className)}>
        <Command shouldFilter={false} className="overflow-visible">
          <div
            className={cn(
              "relative rounded border transition-all hover:border-teal-500",
              isFocused &&
                "border-slate-500 shadow-[0_0_6px_rgba(88,167,165,1)] hover:border-teal-500",
            )}
          >
            <SearchCommandInput
              ref={inputRef}
              value={inputValue}
              onValueChange={handleInputChange}
              onKeyDown={handleKeyDown}
              onFocus={handleFocus}
              onBlur={handleBlur}
              placeholder={placeholder}
              disabled={disabled}
            />
            {!disabled &&
              (inputValue ? (
                <button
                  type="button"
                  onClick={handleClear}
                  className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2"
                >
                  <div className="rounded-full p-1 transition-colors hover:bg-gray-200">
                    <X className="text-foreground h-5 w-5" />
                  </div>
                </button>
              ) : (
                geolocationSupported && (
                  <button
                    type="button"
                    onClick={handleGetCurrentLocation}
                    className="absolute inset-y-0 right-0 flex cursor-pointer items-center pr-2"
                  >
                    <div className="rounded-full p-1 transition-colors hover:bg-gray-200">
                      <MapPin className="text-foreground h-5 w-5" />
                    </div>
                  </button>
                )
              ))}
          </div>

          {isOpen && (
            <div
              className={cn(
                "bg-popover text-popover-foreground animate-in fade-in absolute top-full z-10 mt-1 w-full rounded-md border shadow-md duration-200",
              )}
            >
              <CommandList ref={listRef} className="max-h-full">
                {results.length === 0 &&
                  inputValue.length > 2 &&
                  !isLoading && (
                    <div className="p-4 text-center text-sm">
                      No results found.
                    </div>
                  )}
                {results.map((address) => (
                  <CommandItem
                    key={address.formattedAddress}
                    value={address.formattedAddress}
                    onSelect={() => handleSelect(address)}
                    className="cursor-pointer"
                  >
                    <div className="flex flex-col">
                      <p className="text-sm font-semibold">
                        {address.addressLabel}
                      </p>
                      <p className="text-muted-foreground text-xs">
                        {address.formattedAddress}
                      </p>
                    </div>
                  </CommandItem>
                ))}
              </CommandList>
            </div>
          )}
        </Command>
        {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      </div>
    )
  },
)

GeolocationAutocomplete.displayName = "GeolocationAutocomplete"

export { GeolocationAutocomplete }
export type { GeolocationAutocompleteHandle }
