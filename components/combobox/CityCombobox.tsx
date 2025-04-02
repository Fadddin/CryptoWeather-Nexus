"use client"

import { useState } from "react"
import { Command, CommandInput, CommandList, CommandItem } from "@/components/ui/command"

interface City {
  id: string
  name: string
}

export default function Combobox({
  cities,
  onSelect,
}: {
  cities: City[]
  onSelect: (cityId: string) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = cities.filter((city) =>
    city.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => setOpen(false), 100)} // allow click to register
    >
      <Command>
        <CommandInput
          placeholder="Search cities..."
          value={query}
          onValueChange={setQuery}
        />
        {open && query.length > 0 && (
          <CommandList className="max-h-60 overflow-y-auto border rounded-md mt-2">
            {filtered.map((city) => (
              <CommandItem
                key={city.id}
                onSelect={() => {
                  onSelect(city.id)
                  setQuery("")
                  setOpen(false)
                }}
              >
                {city.name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
