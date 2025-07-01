"use client"

import { useState } from "react"

import { RadarAutocompleteInput } from "@/registry/new-york/radar-autocomplete/radar-autocomplete"
import type { RadarAddress } from "radar-sdk-js/dist/types"

export default function AddressFormExample() {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    address: null as RadarAddress | null,
  })
  const [isSubmitted, setIsSubmitted] = useState(false)

  const handleAddressSelect = (address: RadarAddress) => {
    setFormData((prev) => ({ ...prev, address }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitted(true)
    // Simulate form submission
    setTimeout(() => setIsSubmitted(false), 2000)
  }

  const isFormValid = formData.name && formData.email && formData.address

  return (
    <div className="w-full max-w-md">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <label htmlFor="name" className="text-sm font-medium">
            Full Name
          </label>
          <input
            type="text"
            id="name"
            value={formData.name}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, name: e.target.value }))
            }
            className="w-full h-10 px-3 text-sm border border-input bg-background rounded-md"
            placeholder="Enter your name"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="email" className="text-sm font-medium">
            Email
          </label>
          <input
            type="email"
            id="email"
            value={formData.email}
            onChange={(e) =>
              setFormData((prev) => ({ ...prev, email: e.target.value }))
            }
            className="w-full h-10 px-3 text-sm border border-input bg-background rounded-md"
            placeholder="Enter your email"
          />
        </div>

        <div className="space-y-2">
          <label htmlFor="address" className="text-sm font-medium">
            Delivery Address *
          </label>
          <RadarAutocompleteInput
            apiKey="prj_test_pk_fake_api_key_for_demo"
            onAddressSelect={handleAddressSelect}
            placeholder="Start typing your address..."
            className="w-full"
          />
          {formData.address && (
            <p className="text-xs text-muted-foreground">
              ✓ {formData.address.formattedAddress}
            </p>
          )}
        </div>

        <button
          type="submit"
          disabled={!isFormValid || isSubmitted}
          className="w-full h-10 px-4 text-sm font-medium text-primary-foreground bg-primary rounded-md hover:bg-primary/90 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitted ? "Submitted!" : "Submit Order"}
        </button>
      </form>
    </div>
  )
}
