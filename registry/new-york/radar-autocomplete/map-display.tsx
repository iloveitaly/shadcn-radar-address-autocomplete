import Radar from "radar-sdk-js"
import { useEffect, useRef } from "react"

import { cn } from "@/lib/utils"
import { RADAR_API_KEY } from "@/utils/constants"

import "radar-sdk-js/dist/radar.css"

/**
 * Geolocation point with longitude and latitude coordinates
 */
export interface GeolocationPoint {
  lon: number
  lat: number
}

/**
 * MapDisplay component that shows a map with markers for specified locations
 *
 * @param selectedAddress - Single location to center the map on (fallback when no markers provided)
 * @param markers - Array of locations where markers should be displayed
 * @param className - Optional CSS classes for styling
 */
export function MapDisplay({
  selectedAddress,
  markers = [],
  className,
  ...props
}: {
  selectedAddress?: GeolocationPoint
  markers?: GeolocationPoint[]
  className?: string
} & React.HTMLAttributes<HTMLDivElement>) {
  const mapContainerRef = useRef<HTMLDivElement>(null)
  const mapRef = useRef<ReturnType<typeof Radar.ui.map> | null>(null)

  useEffect(() => {
    Radar.initialize(RADAR_API_KEY)
  }, [])

  useEffect(() => {
    if (!mapContainerRef.current) {
      return
    }

    if (!selectedAddress) {
      return
    }

    // Calculate center point - use first location or selectedAddress
    const centerLocation = selectedAddress
    const center: [number, number] = [centerLocation.lon, centerLocation.lat]

    // Remove existing map if it exists
    if (mapRef.current) {
      mapRef.current.remove()
      mapRef.current = null
    }

    // TODO is this really the best way? We can't just update the map?
    // Create new map with updated location
    mapRef.current = Radar.ui.map({
      container: mapContainerRef.current,
      center,
      // looks like ~30mi radius
      zoom: 10,
    })

    // Add markers for all locations
    markers.forEach((marker) => {
      const markerInstance = Radar.ui
        .marker()
        .setLngLat([marker.lon, marker.lat])
        .addTo(mapRef.current!)

      const popup = Radar.ui.popup({
        text: "Complete the form for more details!",
      })

      markerInstance.setPopup(popup)
    })

    return () => {
      if (mapRef.current) {
        mapRef.current.remove()
        mapRef.current = null
      }
    }
  }, [selectedAddress, markers])

  return (
    <div
      ref={mapContainerRef}
      className={cn("h-[100px] w-[200px] rounded border", className)}
      {...props}
    />
  )
}
