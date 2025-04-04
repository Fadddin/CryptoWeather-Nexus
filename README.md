# CryptoWeather Nexus

CryptoWeather Nexus is a modern, responsive web dashboard that integrates real-time cryptocurrency prices, live weather updates, and the latest crypto news headlines. Built with Next.js, Redux Toolkit, and Tailwind CSS, it delivers a seamless and interactive user experience across devices.

## Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Folder Structure](#folder-structure)
- [Setup Instructions](#setup-instructions)
- [Design Decisions](#design-decisions)
- [Limitations](#limitations)
- [Future Enhancements](#future-enhancements)
- [License](#license)

## Features

- **Real-Time Crypto Tracking**: Live cryptocurrency price updates powered by the CoinCap WebSocket API.
- **Live Weather Updates**: Current weather information for multiple cities via the OpenWeatherMap API.
- **Crypto News**: Up-to-date headlines on cryptocurrencies and financial markets.
- **Favorites Management**: Mark and persist your favorite cryptocurrencies and cities using browser localStorage.
- **Detailed Data Views**: In-depth charts and historical (mock) data for cryptocurrencies and weather.
- **Custom Comboboxes**: Enhanced search and selection components for a streamlined user experience.
- **Responsive Design**: Optimized for both desktop and tablet viewports.

## Tech Stack

- **Framework**: [Next.js 13+ (App Router)](https://nextjs.org/)
- **State Management**: Redux Toolkit with Async Thunks
- **Styling**: Tailwind CSS
- **WebSocket Integration**: CoinCap WebSocket API
- **APIs**:
  - **Crypto Data**: [CoinCap](https://docs.coincap.io)
  - **Weather Data**: [OpenWeatherMap](https://openweathermap.org/api)
  - **News Data**: newsdata.io
- **Charting**: Custom chart components (using Chart.js)

## Folder Structure

```plaintext
.
├── app/ or pages/          # Next.js routing
├── components/
│   ├── dashboard/         # WeatherSection, CryptoSection, NewsSection
│   ├── weather/           # Weather charts and tables
│   ├── crypto/            # Crypto metrics and history
│   └── combobox/          # Custom city and crypto selection UI
├── lib/
│   ├── redux/             # Redux slices and store setup
│   └── websocket.ts       # CoinCap WebSocket handler
├── public/                # Static assets
└── styles/                # Tailwind CSS configurations
```

## Setup Instructions

1. **Clone the Repository**

   Clone the repository to your local machine and navigate to the project directory:
   ```shell
   git clone https://github.com/fadddin/CryptoWeather-Nexus.git
   cd CryptoWeather-Nexus
   ```

2. **Install Dependencies**

   Install the project dependencies using your preferred package manager:
   ```shell
   npm install
   ```
   
   Alternatively, you can use:
   ```shell
   pnpm install
   ```
   
   or
   ```shell
   yarn
   ```

3. **Configure Environment Variables**

   Create a `.env.local` file in the root directory and add your OpenWeatherMap API key:
   ```env
   NEXT_PUBLIC_OPENWEATHER_API_KEY=your_openweathermap_api_key
   NEXT_PUBLIC_NEWSDATA_API_KEY=your_newsdata_api_key
   ```
   
   Note: The CoinCap API does not require an API key for basic usage.

4. **Run the Development Server**

   Start the development server:
   ```shell
   npm dev
   ```
   
   Open http://localhost:3000 in your browser to view the application.

5. **Build and Run for Production**

   To build and run the application in production mode, execute:
   ```shell
   npm build
   npm start
   ```

## Design Decisions

- **Data Flow Management**: Utilizes Redux Toolkit for global state management with async thunks to handle API requests efficiently.
- **Live Updates**: Integrates the CoinCap WebSocket API to receive real-time cryptocurrency price updates, with Redux dispatching the updates.
- **User Preferences**: Persists user selections and favorites in localStorage, ensuring a consistent user experience across sessions.
- **Responsive Layout**: Implements a grid-based layout using Tailwind CSS for optimal performance on both desktop and tablet devices.
- **Custom UI Components**: Employs custom-built combobox components for an enhanced, intuitive search and selection process.

## Limitations

- **WebSocket Connections**: The CoinCap WebSocket API may drop connections if too many coins are subscribed concurrently.
- **Historical Data Simulation**: Historical weather is simulated due to API tier limitations.
- **News Feed Source**: Currently relies on newsdata.io; it only provides 200 free calls.
- **Weather Update Frequency**: Real-time weather updates are limited to a 60-second polling interval.

## Future Enhancements

- **Advanced Charting**: Expand charting capabilities to showcase real-time market trends.
- **Extended Data Integrations**: Integrate with TradingView or CoinGecko for additional analytics.
- **Backend Caching**: Implement caching mechanisms to reduce API call frequency and improve performance.

## License

This project is licensed under the MIT License.