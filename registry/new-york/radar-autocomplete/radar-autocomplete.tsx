/**
 * @fileoverview A ShadCN-compatible React component that integrates Radar's address autocomplete
 * functionality with consistent styling and error handling.
 *
 * @see https://docs.radar.com/maps/autocomplete
 */
import Radar from "radar-sdk-js"
import { useEffect, useRef, useState } from "react"

import { cn } from "@/lib/utils"
import "radar-sdk-js/dist/radar.css"
import type { RadarAddress } from "radar-sdk-js/dist/types"

interface RadarAutocompleteInputProps {
  /** Callback function triggered when an address is selected from the autocomplete results */
  onAddressSelect?: (address: RadarAddress) => void
  /** Placeholder text displayed in the input field */
  placeholder?: string
  /** Additional CSS classes to apply to the container */
  className?: string
  /** Whether the input is disabled */
  disabled?: boolean
  /** Radar API key for initializing the service */
  apiKey: string
}

/**
 * A ShadCN-styled address autocomplete input powered by Radar's geocoding service.
 *
 * Provides real-time address suggestions with error handling and loading states.
 * The component automatically initializes the Radar SDK and manages the autocomplete lifecycle.
 *
 * @param props - The component props
 * @returns A styled autocomplete input with error and loading states
 */
const RadarAutocompleteInput = ({
  onAddressSelect,
  placeholder = "Search address...",
  className,
  disabled = false,
  apiKey,
}: RadarAutocompleteInputProps) => {
  const autocompleteRef = useRef<ReturnType<
    typeof Radar.ui.autocomplete
  > | null>(null)
  const containerRef = useRef<HTMLDivElement>(null)

  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!containerRef.current) {
      setError("Container element not found")
      return
    }

    if (!apiKey) {
      setError("Radar API key is required")
      return
    }

    try {
      Radar.initialize(apiKey)

      autocompleteRef.current = Radar.ui.autocomplete({
        container: containerRef.current,
        placeholder,
        onSelection: (address: RadarAddress) => {
          if (onAddressSelect) {
            onAddressSelect(address)
          }
        },
        onResults: (addresses: RadarAddress[]) => {
          setIsLoading(false)
        },
        onError: (err: Error) => {
          setError(err.message)
          setIsLoading(false)
          console.error("Radar autocomplete error:", err)
        },
      })
    } catch (err) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : "Failed to initialize address search"
      setError(errorMessage)
      console.error("Failed to initialize Radar:", err)
    }

    return () => {
      if (autocompleteRef.current?.remove) {
        autocompleteRef.current.remove()
      }
    }
  }, [onAddressSelect, placeholder, apiKey])

  return (
    <div className="relative">
      <div
        ref={containerRef}
        className={cn(
          "bg-background h-10 w-full text-sm",
          disabled && "cursor-not-allowed opacity-50",
          error && "border-red-500",
          className,
        )}
      />
      {error && <p className="mt-1 text-sm text-red-500">{error}</p>}
      {isLoading && (
        <div className="absolute top-1/2 right-3 -translate-y-1/2">
          <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600" />
        </div>
      )}
    </div>
  )
}

export { RadarAutocompleteInput }
