import { STORE_WATCH_URL } from "@/lib/api-config";
import { Order } from "@/types";
import { useEffect, useState } from "react";
import SSE from "react-native-sse";

/**
 * Hook for store owners to listen for real-time new order notifications.
 * Connects via SSE and triggers a callback when a NEW_ORDER event is received.
 */
export const useStoreWatch = (
  onNewOrder?: (order: Order) => void,
  onOrderUpdate?: (data: { order_id: number, order_status: string }) => void
) => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    let sse: SSE | null = null;

    try {
      const url = STORE_WATCH_URL();
      console.log("🏪 Connecting to Store Watch SSE:", url);

      sse = new SSE(url, {
        method: "GET",
        withCredentials: true,
      });

      sse.addEventListener("open", () => {
        console.log("✅ Store Watch SSE Connected");
        setIsConnected(true);
      });

      sse.addEventListener("message", (event) => {
        if (!event.data || event.data.startsWith(':')) return;

        try {
          const data = JSON.parse(event.data);
          if (data.type === 'NEW_ORDER' && data.order) {
            console.log("🆕 New Order Received:", data.order.order_id);
            onNewOrder?.(data.order);
          } else if (data.type === 'ORDER_UPDATE') {
            console.log("🔄 Order Updated:", data.order_id, data.order_status);
            onOrderUpdate?.(data);
          }
        } catch (err) {
          console.error("❌ Failed to parse Store SSE message", err);
        }
      });

      sse.addEventListener("error", (err) => {
        console.error("⚠️ Store Watch SSE Error - Full Details:");
        console.error("Error object:", JSON.stringify(err, null, 2));
        console.error("Error message:", (err as any)?.message);
        console.error("Error type:", err?.type);
        console.error("Connection URL:", url);
        console.error("Credentials:", "include (withCredentials: true)");
        setIsConnected(false);
      });

    } catch (err) {
      console.error("❌ Failed to initialize Store Watch SSE", err);
    }

    return () => {
      if (sse) {
        console.log("🔌 Closing Store Watch SSE");
        sse.close();
      }
    };
  }, [onNewOrder, onOrderUpdate]);

  return { isConnected };
};
