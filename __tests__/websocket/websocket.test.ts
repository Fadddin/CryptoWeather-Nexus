// websocket.test.ts
import { connectCryptoWebSocket, connectWebSocket } from "@/lib/websocket";

describe("WebSocket Utility Functions", () => {
  // Save the original WebSocket so we can restore it after tests.
  let OriginalWebSocket: any;

  // Define a mock WebSocket class to simulate behavior.
  class MockWebSocket {
    url: string;
    onopen: ((event: any) => void) | null = null;
    onmessage: ((event: any) => void) | null = null;
    onerror: ((event: any) => void) | null = null;
    onclose: ((event: any) => void) | null = null;
    static instances: MockWebSocket[] = [];

    constructor(url: string) {
      this.url = url;
      MockWebSocket.instances.push(this);
      // Simulate an async connection open.
      setTimeout(() => {
        if (this.onopen) this.onopen({ type: "open" });
      }, 0);
    }

    close() {
      if (this.onclose) {
        this.onclose({ type: "close" });
      }
    }

    // Helper to manually trigger events.
    trigger(eventName: "open" | "message" | "error" | "close", data: any) {
      if (eventName === "open" && this.onopen) {
        this.onopen({ type: "open" });
      } else if (eventName === "message" && this.onmessage) {
        this.onmessage({ data });
      } else if (eventName === "error" && this.onerror) {
        this.onerror({ error: data });
      } else if (eventName === "close" && this.onclose) {
        this.onclose({ type: "close" });
      }
    }
  }

  beforeAll(() => {
    OriginalWebSocket = (global as any).WebSocket;
    (global as any).WebSocket = MockWebSocket;
  });

  afterAll(() => {
    (global as any).WebSocket = OriginalWebSocket;
  });

  beforeEach(() => {
    // Reset the list of instances before each test.
    MockWebSocket.instances = [];
    jest.useFakeTimers();
  });

  afterEach(() => {
    jest.clearAllTimers();
    jest.useRealTimers();
  });

  describe("connectCryptoWebSocket", () => {
    it("should create a WebSocket with the correct URL", () => {
      const coinIds = ["bitcoin", "ethereum"];
      const onPriceUpdate = jest.fn();
      const { disconnect } = connectCryptoWebSocket(coinIds, onPriceUpdate);

      expect(MockWebSocket.instances.length).toBeGreaterThan(0);
      const instance = MockWebSocket.instances[0];
      expect(instance.url).toBe("wss://ws.coincap.io/prices?assets=bitcoin,ethereum");
      disconnect();
    });

    it("should call onPriceUpdate on receiving a message", () => {
      const coinIds = ["bitcoin"];
      const onPriceUpdate = jest.fn();
      const { disconnect } = connectCryptoWebSocket(coinIds, onPriceUpdate);

      const instance = MockWebSocket.instances[0];
      // Simulate a message event with a JSON payload.
      const messageData = JSON.stringify({ bitcoin: "50000" });
      instance.trigger("message", messageData);

      expect(onPriceUpdate).toHaveBeenCalledWith("bitcoin", 50000);
      disconnect();
    });

    it("should reconnect after socket closes", () => {
      const setTimeoutSpy = jest.spyOn(global, "setTimeout");
      const coinIds = ["bitcoin"];
      const onPriceUpdate = jest.fn();
      const { disconnect } = connectCryptoWebSocket(coinIds, onPriceUpdate);
    
      const firstInstance = MockWebSocket.instances[0];
      // Simulate a close event on the first WebSocket instance.
      firstInstance.trigger("close", null);
    
      // Filter out calls to setTimeout that use the reconnect delay.
      const reconnectCalls = setTimeoutSpy.mock.calls.filter(
        ([, delay]) => delay === 5000
      );
      expect(reconnectCalls.length).toBe(1);
    
      // Fast-forward timer to trigger the reconnect.
      jest.advanceTimersByTime(5000);
    
      // A new WebSocket instance should be created.
      expect(MockWebSocket.instances.length).toBe(2);
      disconnect();
      setTimeoutSpy.mockRestore();
    });
    

    it("disconnect should clear reconnect timeout and close the socket", () => {
      const coinIds = ["bitcoin"];
      const onPriceUpdate = jest.fn();
      const { disconnect } = connectCryptoWebSocket(coinIds, onPriceUpdate);
      const instance = MockWebSocket.instances[0];

      // Spy on the close method.
      const closeSpy = jest.spyOn(instance, "close");
      disconnect();
      expect(closeSpy).toHaveBeenCalled();
    });
  });

  describe("connectWebSocket", () => {
    it("should create a WebSocket with the correct URL", () => {
      const wrapper = connectWebSocket();
      expect(MockWebSocket.instances.length).toBeGreaterThan(0);
      const instance = MockWebSocket.instances[0];
      expect(instance.url).toBe("wss://ws.coincap.io/prices?assets=bitcoin,ethereum,solana");
      wrapper.disconnect();
    });

    it("should call wrapper's socket.onmessage on underlying socket message", () => {
      const wrapper = connectWebSocket();
      const instance = MockWebSocket.instances[0];

      // Set a mock for the wrapper's onmessage.
      const onMessageMock = jest.fn();
      wrapper.socket.onmessage = onMessageMock;

      // Simulate an underlying WebSocket message with price data.
      const messageData = JSON.stringify({ bitcoin: "60000" });
      instance.trigger("message", messageData);

      // The wrapper should transform the event and call the onmessage callback.
      expect(onMessageMock).toHaveBeenCalled();
      const eventArg = onMessageMock.mock.calls[0][0];
      const parsedData = JSON.parse(eventArg.data);
      expect(parsedData.type).toBe("price_alert");
      expect(parsedData.crypto).toBe("Bitcoin");
      expect(parsedData.message).toContain("60000.00");
      wrapper.disconnect();
    });

    it("should send fake events periodically", () => {
      const wrapper = connectWebSocket();
      const onMessageMock = jest.fn();
      wrapper.socket.onmessage = onMessageMock;

      // Advance the timer by 15 seconds to trigger the fake event interval.
      jest.advanceTimersByTime(15000);
      expect(onMessageMock).toHaveBeenCalled();
      wrapper.disconnect();
    });

    it("disconnect should close the underlying WebSocket", () => {
      const wrapper = connectWebSocket();
      const instance = MockWebSocket.instances[0];

      const closeSpy = jest.spyOn(instance, "close");
      wrapper.disconnect();
      expect(closeSpy).toHaveBeenCalled();
    });
  });
});
