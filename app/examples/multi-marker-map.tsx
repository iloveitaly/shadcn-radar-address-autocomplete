import { useState } from "react"

import {
  MapDisplay,
  type GeolocationPoint,
} from "@/registry/new-york/radar-autocomplete/map-display"

export default function MultiMarkerMapExample() {
  const [locations] = useState<GeolocationPoint[]>([
    { lat: 40.7128, lon: -74.006 }, // New York City
    { lat: 40.7589, lon: -73.9851 }, // Times Square
    { lat: 40.7484, lon: -73.9857 }, // Empire State Building
    { lat: 40.7614, lon: -73.9776 }, // Central Park
  ])

  // Center the map on NYC
  const center: GeolocationPoint = { lat: 40.7128, lon: -74.006 }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Multiple Markers</label>
        <p className="text-sm text-muted-foreground">
          Display multiple locations on a single map
        </p>
      </div>

      <MapDisplay
        selectedAddress={center}
        markers={locations}
        className="h-[400px] w-full"
      />

      <div className="p-3 bg-muted rounded-md">
        <p className="text-sm font-medium mb-1">Markers:</p>
        <ul className="text-xs text-muted-foreground space-y-1">
          <li>• New York City</li>
          <li>• Times Square</li>
          <li>• Empire State Building</li>
          <li>• Central Park</li>
        </ul>
      </div>
    </div>
  )
}
