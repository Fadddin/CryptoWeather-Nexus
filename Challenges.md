# Challenges Faced & Resolutions

## 1. WebSocket Frame Header Error (CoinCap)
#### Challenge: While connecting to the CoinCap WebSocket API, the connection failed intermittently with a "frame header error".

#### Resolution: A robust WebSocket reconnection mechanism was added to detect connection drops and automatically reconnect. This made real-time price updates more reliable and fault-tolerant.

## 2. API Rate Limits
#### Challenge: OpenWeatherMap’s free tier enforced limits on the number of API calls, especially when polling multiple cities.

#### Resolution: Introduced interval-based polling (every 60 seconds) with local caching, minimizing redundant API requests while keeping the data reasonably fresh.

## 3. Lack of Historical Data
#### Challenge: Free tier OpenWeatherMap do not provide historical data.

#### Resolution: Utilized simulated mock historical data for charts and graphs. Planned integration with premium APIs in future versions.