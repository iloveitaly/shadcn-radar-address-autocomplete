import { useState } from "react"

import { RadarAutocompleteInput } from "@/registry/new-york/radar-autocomplete/radar-autocomplete"
import type { RadarAddress } from "radar-sdk-js/dist/types"

export default function BasicAddressSearchExample() {
  const [selectedAddress, setSelectedAddress] = useState<RadarAddress | null>(
    null,
  )

  const handleAddressSelect = (address: RadarAddress) => {
    setSelectedAddress(address)
  }

  return (
    <div className="w-full max-w-md space-y-4">
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
        </div>
      )}
    </div>
  )
}
