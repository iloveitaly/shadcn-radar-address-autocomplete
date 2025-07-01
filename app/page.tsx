import * as React from "react"

import BasicAddressSearchExample from "@/app/examples/basic-address-search"
import DisabledStateExample from "@/app/examples/disabled-state"
import { OpenInV0Button } from "@/components/open-in-v0-button"
import { RegistryCommand } from "@/components/registry-command"
import { ShowSourceButton } from "@/components/show-source-button"

// This page displays items from the custom registry.
// You are free to implement this with your own design as needed.

interface ComponentDisplayProps {
  name: string
  description: string
  minHeight?: string
  filePath: string
  children: React.ReactNode
}

function ComponentDisplay({
  name,
  description,
  minHeight = "400px",
  filePath,
  children,
}: ComponentDisplayProps) {
  return (
    <div className="flex flex-col gap-4 border rounded-lg p-4 min-h-[450px] relative">
      <div className="flex items-center justify-between">
        <h2 className="text-sm text-muted-foreground sm:pl-3">{description}</h2>
        <div className="flex gap-2">
          <ShowSourceButton filePath={filePath} />
          <OpenInV0Button name={name} />
        </div>
      </div>
      <div
        className={`flex items-center justify-center min-h-[${minHeight}] relative`}
      >
        {children}
      </div>
    </div>
  )
}

export default function Home() {
  return (
    <div className="max-w-3xl mx-auto flex flex-col min-h-svh px-4 py-8 gap-8">
      <header className="flex flex-col gap-1 space-y-6 mb-6">
        <h1 className="text-3xl font-bold tracking-tight">
          ShadCN Radar Address Autocomplete
        </h1>
        <p className="text-muted-foreground">
          A ShadCN-compatible React component that integrates Radar's powerful
          address autocomplete functionality with beautiful, accessible UI
          components. Perfect for forms, checkout flows, and location-based
          applications.
        </p>
        <div className="p-3 bg-muted rounded-md text-sm">
          <p className="font-medium mb-1">⚠️ API Key Required</p>
          <p className="text-muted-foreground">
            A public Radar API key is required for the autocomplete to work. Set
            the{" "}
            <code className="px-1 py-0.5 bg-background rounded text-xs">
              VITE_RADAR_API_KEY
            </code>{" "}
            environment variable or pass your API key directly to the component.
          </p>
        </div>
        <RegistryCommand registryId="radar-autocomplete" />
      </header>

      <main className="flex flex-col flex-1 gap-8">
        <ComponentDisplay
          name="radar-autocomplete"
          description="Basic address search with real-time suggestions"
          filePath="app/examples/basic-address-search.tsx"
        >
          <BasicAddressSearchExample />
        </ComponentDisplay>

        <ComponentDisplay
          name="radar-autocomplete"
          description="Disabled state and conditional enabling"
          filePath="app/examples/disabled-state.tsx"
        >
          <DisabledStateExample />
        </ComponentDisplay>
      </main>
    </div>
  )
}
