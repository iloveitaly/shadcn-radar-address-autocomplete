"use client"

import { useState } from "react"

import { RadarAutocompleteInput } from "@/registry/new-york/radar-autocomplete/radar-autocomplete"
import type { RadarAddress } from "radar-sdk-js/dist/types"

export default function DisabledStateExample() {
  const [isEnabled, setIsEnabled] = useState(false)
  const [selectedAddress, setSelectedAddress] = useState<RadarAddress | null>(
    null,
  )

  const handleAddressSelect = (address: RadarAddress | null) => {
    setSelectedAddress(address)
  }

  return (
    <div className="w-full max-w-md space-y-4">
      <div className="space-y-3">
        <div className="flex items-center space-x-2">
          <input
            type="checkbox"
            id="enable-address"
            checked={isEnabled}
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="w-4 h-4"
          />
          <label htmlFor="enable-address" className="text-sm font-medium">
            Enable address lookup
          </label>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium text-muted-foreground">
            Shipping Address
          </label>
          <RadarAutocompleteInput
            apiKey="prj_test_pk_fake_api_key_for_demo"
            onAddressSelect={handleAddressSelect}
            placeholder={
              isEnabled ? "Search address..." : "Enable address lookup first"
            }
            disabled={!isEnabled}
            className="w-full"
          />
        </div>

        {!isEnabled && (
          <p className="text-xs text-muted-foreground">
            Check the box above to enable address search functionality.
          </p>
        )}

        {isEnabled && selectedAddress && (
          <div className="p-3 bg-muted rounded-md">
            <p className="text-sm font-medium mb-1">Selected:</p>
            <p className="text-sm text-muted-foreground">
              {selectedAddress.formattedAddress}
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
