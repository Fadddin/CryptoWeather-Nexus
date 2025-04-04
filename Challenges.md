# Challenges Faced & Resolutions

## 1. WebSocket Connection Instability

### Challenge:
Using CoinCap WebSocket for real-time crypto price updates occasionally resulted in disconnections or premature closures (e.g., “WebSocket closed before connection established”).

### Resolution:

- Implemented an auto-reconnect mechanism with exponential backoff using setTimeout.

- Isolated WebSocket logic into a utility (connectCryptoWebSocket) with a clean disconnect() method to prevent memory leaks on route changes.


## 2. WebSocket Frame Header Errors on CoinCap

### Challenge:
Attempting to connect too early or subscribing to too many coins resulted in frame header errors.

### Resolution:

- Reduced the number of assets subscribed at once.

- Used a fallback mechanism to show static data until connection stabilizes.

- Added graceful error handling and user feedback.

## 3. CoinGecko API CORS Issues (When Attempted Initially)
### Challenge:
CoinGecko’s API returned CORS errors during frontend requests in deployment (especially with Vercel).

### Resolution:

- Switched to CoinCap for both REST and WebSocket as it doesn't require API keys or CORS bypass.

- All fetching was done directly from the frontend due to CoinCap’s open API policy.

## 4. Maintaining Favorite State Between Sessions
### Challenge:
User selections and favorites were lost after reloads or new sessions.

### Resolution:

- Implemented localStorage sync for both selectedIds and favoriteIds.

- Used useEffect to restore data on app load.

## 5. API Limits
### Challenge: 
OpenWeatherMap’s free tier enforced limits on the number of API calls, especially when polling multiple cities.

### Resolution: 
- Introduced interval-based polling (every 60 seconds) with local caching, minimizing redundant API requests while keeping the data reasonably fresh.

## 6. Lack of Historical Data
### Challenge: 
Free tier OpenWeatherMap do not provide historical data.

### Resolution: 
- Utilized simulated mock historical data for charts and graphs. Planned integration with premium APIs in future versions.