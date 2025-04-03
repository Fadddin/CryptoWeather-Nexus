"use client"

// 🔁 Utility for reconnect delays
const RECONNECT_DELAY = 5000

/**
 * Real-time CoinCap WebSocket for crypto price updates
 */
export function connectCryptoWebSocket(
  coinIds: string[],
  onPriceUpdate: (id: string, price: number) => void
): { disconnect: () => void } {
  let socket: WebSocket | null = null
  let reconnectTimeout: NodeJS.Timeout

  const url = `wss://ws.coincap.io/prices?assets=${coinIds.join(",")}`

  const connect = () => {
    console.log(`[WebSocket] Connecting to ${url}`)
    socket = new WebSocket(url)

    socket.onopen = () => {
      console.log("[WebSocket] Connected to CoinCap ✅")
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      for (const [coinId, price] of Object.entries(data)) {
        onPriceUpdate(coinId, parseFloat(price as string))
      }
    }

    socket.onerror = (err) => {
      console.error("[WebSocket] Error:", err)
    }

    socket.onclose = () => {
      console.warn("[WebSocket] Disconnected. Reconnecting in 5s... 🔁")
      reconnectTimeout = setTimeout(connect, RECONNECT_DELAY)
    }
  }

  connect()

  return {
    disconnect: () => {
      clearTimeout(reconnectTimeout)
      socket?.close()
      console.log("[WebSocket] Manually disconnected")
    },
  }
}

/**
 * Simulated WebSocket for dashboard toast alerts (price & weather)
 */
export function connectWebSocket() {
  let socket: WebSocket | null = null
  const url = `wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana`

  const wrapper = {
    socket: {
      onmessage: null as null | ((event: MessageEvent) => void),
    },
    disconnect: () => {
      socket?.close()
      console.log("[WebSocket] Disconnected from Dashboard feed")
    },
  }

  const connect = () => {
    socket = new WebSocket(url)

    socket.onopen = () => {
      console.log("[WebSocket] Dashboard socket connected ✅")
    }

    socket.onmessage = (event) => {
      const data = JSON.parse(event.data)
      const [coinId, price] = Object.entries(data)[0]

      const mockEvent = {
        data: JSON.stringify({
          type: "price_alert",
          crypto: coinId.charAt(0).toUpperCase() + coinId.slice(1),
          message: `Price updated: $${parseFloat(price as string).toFixed(2)}`,
        }),
      }

      wrapper.socket.onmessage?.(mockEvent as MessageEvent)
    }

    socket.onerror = (err) => {
      console.error("[WebSocket] Dashboard socket error:", err)
    }

    socket.onclose = () => {
      console.warn("[WebSocket] Dashboard socket disconnected. Retrying in 5s...")
      setTimeout(connect, RECONNECT_DELAY)
    }
  }

  connect()

  return wrapper
}
