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
    try {
      socket = new WebSocket(url)

      socket.onopen = () => {
        if (process.env.NODE_ENV === "development") {
          console.log("[WebSocket] Connected ✅")
        }
      }

      socket.onmessage = (event) => {
        const data = JSON.parse(event.data)
        for (const [coinId, price] of Object.entries(data)) {
          onPriceUpdate(coinId, parseFloat(price as string))
        }
      }

      socket.onerror = () => {
        // Suppress all errors unless in dev
        if (process.env.NODE_ENV === "development") {
          console.warn("[WebSocket] Connection error ❌")
        }
      }

      socket.onclose = () => {
        if (process.env.NODE_ENV === "development") {
          console.warn("[WebSocket] Disconnected. Reconnecting in 5s... 🔁")
        }
        reconnectTimeout = setTimeout(connect, 5000)
      }
    } catch (err) {
      if (process.env.NODE_ENV === "development") {
        console.error("[WebSocket] Exception:", err)
      }
    }
  }

  connect()

  return {
    disconnect: () => {
      clearTimeout(reconnectTimeout)
      if (socket?.readyState === WebSocket.OPEN || socket?.readyState === WebSocket.CONNECTING) {
        socket.close()
      }
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

    },
  }

  const interval = setInterval(() => {
    const fakeEvents = [
      {
        type: "price_alert",
        crypto: "Bitcoin",
        message: `Price updated: $${(28000 + Math.random() * 1000).toFixed(2)}`,
      },
      {
        type: "weather_alert",
        city: "Mumbai",
        message: "⚠️ Heavy rainfall alert for Mumbai today!",
      },
      {
        type: "weather_alert",
        city: "London",
        message: "🌧️ Storm expected in London. Stay safe!",
      },
    ]

    const random = fakeEvents[Math.floor(Math.random() * fakeEvents.length)]

    const mockEvent = {
      data: JSON.stringify(random),
    }

    wrapper.socket.onmessage?.(mockEvent as MessageEvent)
  }, 15000) // Every 15 seconds

  const connect = () => {
    socket = new WebSocket(url)

    socket.onopen = () => {

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

    }

    socket.onclose = () => {

      setTimeout(connect, RECONNECT_DELAY)
    }
  }

  connect()

  return wrapper
}
