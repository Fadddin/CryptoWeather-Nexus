// cryptoSlice.test.ts
import cryptoReducer, {
  toggleFavoriteCrypto,
  setSelectedCryptos,
  setFavoriteCryptoIds,
  updateCryptoPrice,
  fetchCryptos,
  CryptoState,
} from "../../lib/redux/slices/cryptoSlice";

describe("cryptoSlice", () => {
  const initialState: CryptoState = {
    cryptos: [],
    loading: false,
    error: null,
    selectedCryptoIds: ["bitcoin", "ethereum", "solana"],
    favoriteCryptoIds: [],
  };

  it("should return the initial state", () => {
    expect(cryptoReducer(undefined, { type: "unknown" })).toEqual(initialState);
  });

  it("should toggle a crypto to favorite when not already favorited", () => {
    const stateWithCrypto: CryptoState = {
      ...initialState,
      cryptos: [
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          price: 50000,
          priceChange24h: 2,
          marketCap: 1000000,
          isFavorite: false,
        },
      ],
      favoriteCryptoIds: [],
    };

    const nextState = cryptoReducer(stateWithCrypto, toggleFavoriteCrypto("bitcoin"));
    // Verify that the crypto is now marked as favorite and its id is added to favoriteCryptoIds.
    expect(nextState.cryptos[0].isFavorite).toBe(true);
    expect(nextState.favoriteCryptoIds).toContain("bitcoin");
  });

  it("should toggle a crypto to not favorite when already favorited", () => {
    const stateWithCrypto: CryptoState = {
      ...initialState,
      cryptos: [
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          price: 50000,
          priceChange24h: 2,
          marketCap: 1000000,
          isFavorite: true,
        },
      ],
      favoriteCryptoIds: ["bitcoin"],
    };

    const nextState = cryptoReducer(stateWithCrypto, toggleFavoriteCrypto("bitcoin"));
    // Verify that the crypto is now not marked as favorite and its id is removed from favoriteCryptoIds.
    expect(nextState.cryptos[0].isFavorite).toBe(false);
    expect(nextState.favoriteCryptoIds).not.toContain("bitcoin");
  });

  it("should handle setSelectedCryptos", () => {
    const newSelected = ["dogecoin", "cardano"];
    const nextState = cryptoReducer(initialState, setSelectedCryptos(newSelected));
    expect(nextState.selectedCryptoIds).toEqual(newSelected);
  });

  it("should handle setFavoriteCryptoIds", () => {
    const newFavorites = ["ethereum", "solana"];
    const nextState = cryptoReducer(initialState, setFavoriteCryptoIds(newFavorites));
    expect(nextState.favoriteCryptoIds).toEqual(newFavorites);
  });

  it("should handle updateCryptoPrice", () => {
    const stateWithCrypto: CryptoState = {
      ...initialState,
      cryptos: [
        {
          id: "ethereum",
          name: "Ethereum",
          symbol: "ETH",
          price: 3000,
          priceChange24h: 1.5,
          marketCap: 500000,
          isFavorite: false,
        },
      ],
    };

    const nextState = cryptoReducer(stateWithCrypto, updateCryptoPrice({ id: "ethereum", price: 3500 }));
    expect(nextState.cryptos[0].price).toBe(3500);
  });

  describe("extraReducers", () => {
    it("should handle fetchCryptos.pending", () => {
      const action = { type: fetchCryptos.pending.type };
      const nextState = cryptoReducer(initialState, action);
      expect(nextState.loading).toBe(true);
      expect(nextState.error).toBeNull();
    });

    it("should handle fetchCryptos.fulfilled", () => {
      // Sample payload returned from the API.
      const samplePayload = [
        {
          id: "bitcoin",
          name: "Bitcoin",
          symbol: "BTC",
          price: 60000,
          priceChange24h: 3,
          marketCap: 1200000,
          isFavorite: false,
        },
        {
          id: "ethereum",
          name: "Ethereum",
          symbol: "ETH",
          price: 4000,
          priceChange24h: 2,
          marketCap: 600000,
          isFavorite: false,
        },
      ];

      // Assume that "ethereum" is already in the favorites list.
      const stateWithFavorites: CryptoState = {
        ...initialState,
        favoriteCryptoIds: ["ethereum"],
      };

      const action = { type: fetchCryptos.fulfilled.type, payload: samplePayload };
      const nextState = cryptoReducer(stateWithFavorites, action);

      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBeNull();
      expect(nextState.cryptos.length).toBe(2);
      // Verify that the isFavorite flag is set correctly based on favoriteCryptoIds.
      expect(nextState.cryptos.find((c) => c.id === "ethereum")?.isFavorite).toBe(true);
      expect(nextState.cryptos.find((c) => c.id === "bitcoin")?.isFavorite).toBe(false);
    });

    it("should handle fetchCryptos.rejected", () => {
      const errorMessage = "Network Error";
      const action = { type: fetchCryptos.rejected.type, error: { message: errorMessage } };
      const nextState = cryptoReducer(initialState, action);
      expect(nextState.loading).toBe(false);
      expect(nextState.error).toBe(errorMessage);
    });
  });
});
