import { useState } from "react"

import {
  MapDisplay,
  type GeolocationPoint,
} from "@/registry/new-york/radar-autocomplete/map-display"
import { RadarAutocompleteInput } from "@/registry/new-york/radar-autocomplete/radar-autocomplete"
import type { RadarAddress } from "radar-sdk-js/dist/types"

export default function MapWithAutocompleteExample() {
  const [selectedAddress, setSelectedAddress] = useState<RadarAddress | null>(
    null,
  )
  const [mapLocation, setMapLocation] = useState<GeolocationPoint | undefined>()

  const handleAddressSelect = (address: RadarAddress | null) => {
    setSelectedAddress(address)

    if (address?.latitude && address?.longitude) {
      setMapLocation({
        lat: address.latitude,
        lon: address.longitude,
      })
    }
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-2">
        <label className="text-sm font-medium">Address Search with Map</label>
        <p className="text-sm text-muted-foreground">
          Search for an address and view it on the map
        </p>
      </div>

      <div className="space-y-2">
        <label htmlFor="address-search" className="text-sm font-medium">
          Search Address
        </label>
        <RadarAutocompleteInput
          apiKey="prj_test_pk_fake_api_key_for_demo"
          onAddressSelect={handleAddressSelect}
          placeholder="Search by address or ZIP code..."
          className="w-full"
        />
      </div>

      {mapLocation && (
        <>
          <MapDisplay
            selectedAddress={mapLocation}
            markers={[mapLocation]}
            className="h-[400px] w-full"
          />

          {selectedAddress && (
            <div className="p-3 bg-muted rounded-md">
              <p className="text-sm font-medium mb-1">Selected Address:</p>
              <p className="text-sm text-muted-foreground">
                {selectedAddress.formattedAddress}
              </p>
              {selectedAddress.city && selectedAddress.state && (
                <p className="text-xs text-muted-foreground mt-1">
                  {selectedAddress.city}, {selectedAddress.state}{" "}
                  {selectedAddress.postalCode}
                </p>
              )}
              <p className="text-xs text-muted-foreground mt-1">
                Coordinates: {mapLocation.lat.toFixed(4)},{" "}
                {mapLocation.lon.toFixed(4)}
              </p>
            </div>
          )}
        </>
      )}
    </div>
  )
}
