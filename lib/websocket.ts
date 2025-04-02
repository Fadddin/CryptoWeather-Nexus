"use client"

// This is a mock WebSocket implementation for demonstration purposes
// In a real app, you would connect to a real WebSocket server

export function connectWebSocket() {
  console.log("Connecting to WebSocket...")

  // Mock WebSocket events
  const mockSocket = {
    onmessage: (event: any) => {},
    onopen: () => {},
    onclose: () => {},
    onerror: () => {},
  }

  // Simulate WebSocket messages
  const interval = setInterval(() => {
    // Randomly decide whether to send a crypto or weather alert
    const isWeatherAlert = Math.random() > 0.7

    if (isWeatherAlert) {
      const cities = ["New York", "London", "Tokyo"]
      const alerts = [
        "Heavy rain expected in the next 24 hours",
        "Temperature dropping significantly overnight",
        "Strong winds advisory in effect",
        "Heat wave warning issued",
      ]

      const city = cities[Math.floor(Math.random() * cities.length)]
      const alert = alerts[Math.floor(Math.random() * alerts.length)]

      const event = {
        data: JSON.stringify({
          type: "weather_alert",
          city,
          message: `${city}: ${alert}`,
        }),
      }

      if (mockSocket.onmessage) {
        mockSocket.onmessage(event)
      }
    } else {
      const cryptos = ["Bitcoin", "Ethereum", "Solana"]
      const movements = [
        "up 2% in the last hour",
        "down 1.5% in the last hour",
        "experiencing high volatility",
        "reached a new daily high",
      ]

      const crypto = cryptos[Math.floor(Math.random() * cryptos.length)]
      const movement = movements[Math.floor(Math.random() * movements.length)]

      const event = {
        data: JSON.stringify({
          type: "price_alert",
          crypto,
          message: `${movement}`,
        }),
      }

      if (mockSocket.onmessage) {
        mockSocket.onmessage(event)
      }
    }
  }, 30000) // Send a message every 30 seconds

  // Return mock socket and disconnect function
  return {
    socket: mockSocket,
    disconnect: () => {
      console.log("Disconnecting from WebSocket...")
      clearInterval(interval)
    },
  }
}

