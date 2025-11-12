import { useState } from "react"

import {
  MapDisplay,
  type GeolocationPoint,
} from "@/registry/new-york/radar-autocomplete/map-display"

export default function BasicMapDisplayExample() {
  const [location] = useState<GeolocationPoint>({
    lat: 40.7128,
    lon: -74.006,
  })

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Basic Map Display</label>
        <p className="text-sm text-muted-foreground">
          Showing New York City with a single marker
        </p>
      </div>

      <MapDisplay
        selectedAddress={location}
        markers={[location]}
        className="h-[400px] w-full"
      />

      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm font-medium mb-1">Location Details:</p>
        <p className="text-xs text-muted-foreground">
          Latitude: {location.lat}, Longitude: {location.lon}
        </p>
      </div>
    </div>
  )
}
