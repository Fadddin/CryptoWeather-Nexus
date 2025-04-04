"use client"

import { useState } from "react"
import { Command, CommandInput, CommandItem, CommandList } from "@/components/ui/command"

const availableCryptos = [
  { id: "bitcoin", name: "Bitcoin" },
  { id: "ethereum", name: "Ethereum" },
  { id: "solana", name: "Solana" },
  { id: "dogecoin", name: "Dogecoin" },
  { id: "litecoin", name: "Litecoin" },
  { id: "ripple", name: "Ripple" },
  { id: "polkadot", name: "Polkadot" },
  { id: "cardano", name: "Cardano" },
  { id: "avalanche", name: "Avalanche" },
]

export default function CryptoCombobox({
  onSelect,
}: {
  onSelect: (id: string) => void
}) {
  const [query, setQuery] = useState("")
  const [open, setOpen] = useState(false)

  const filtered = availableCryptos.filter((c) =>
    c.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div
      onFocus={() => setOpen(true)}
      onBlur={() => setTimeout(() => setOpen(false), 100)}
    >
      <Command>
        <CommandInput
          placeholder="Search cryptocurrencies..."
          value={query}
          onValueChange={setQuery}
        />
        {open && query.length > 0 && (
          <CommandList>
            {filtered.map((crypto) => (
              <CommandItem
                key={crypto.id}
                onSelect={() => {
                  onSelect(crypto.id)
                  setQuery("")
                  setOpen(false)
                }}
              >
                {crypto.name}
              </CommandItem>
            ))}
          </CommandList>
        )}
      </Command>
    </div>
  )
}
