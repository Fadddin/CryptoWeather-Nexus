"use client"

import { useState, useRef } from "react"

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
  const inputRef = useRef<HTMLInputElement>(null)

  const filtered = availableCryptos.filter((crypto) =>
    crypto.name.toLowerCase().includes(query.toLowerCase())
  )

  return (
    <div className="relative w-full" onBlur={() => setTimeout(() => setOpen(false), 100)}>
      <input
        type="text"
        ref={inputRef}
        placeholder="Search cryptocurrencies..."
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onFocus={() => setOpen(true)}
        className="w-full px-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-900 dark:border-gray-700 dark:text-white"
      />

      {open && query.length > 0 && (
        <ul className="absolute z-10 mt-2 w-full max-h-60 overflow-y-auto bg-white border border-gray-300 rounded-md shadow-md dark:bg-gray-800 dark:border-gray-700">
          {filtered.length > 0 ? (
            filtered.map((crypto) => (
              <li
                key={crypto.id}
                className="px-4 py-2 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700 dark:text-white"
                onClick={() => {
                  onSelect(crypto.id)
                  setQuery("")
                  setOpen(false)
                  inputRef.current?.blur()
                }}
              >
                {crypto.name}
              </li>
            ))
          ) : (
            <li className="px-4 py-2 text-sm text-gray-500 dark:text-gray-400">
              No cryptocurrencies found
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
