import { ORDER_WATCH_URL } from "@/lib/api-config";
import { OrderStatus } from "@/types";
import { useEffect, useState } from "react";
import SSE from "react-native-sse";

/**
 * Hook to track order status in real-time via SSE.
 * Connects to the watch endpoint and updates status instantly.
 */
export const useOrderTracking = (orderId: number | string, initialStatus: OrderStatus) => {
  const [status, setStatus] = useState<OrderStatus>(initialStatus);
  const [isConnected, setIsConnected] = useState(false);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [msg, ...prev].slice(0, 5));
  };

  useEffect(() => {
    if (!orderId) return;
    
    const url = `${ORDER_WATCH_URL(orderId)}`;
    addLog(`Attempting connection...`);
    
    const sse = new SSE(url, {
      method: "GET",
      withCredentials: true,
    });

    sse.addEventListener("open", () => {
      addLog(`✅ Connected`);
      setIsConnected(true);
    });

    sse.addEventListener("message", (event) => {
      try {
        if (!event.data) return;

        if (event.data.startsWith(':')) {
          addLog(`💓 Heartbeat`);
          return;
        }

        const data = JSON.parse(event.data);
        if (data.status) {
          addLog(`🔔 New Status: ${data.status}`);
          setStatus(data.status as OrderStatus);

          if (data.status === "DELIVERED" || data.status === "CANCELLED") {
            addLog(`🏁 Closing (Terminal Status)`);
            sse.close();
            setIsConnected(false);
          }
        }
      } catch (err) {
        addLog(`❌ Parse Error`);
      }
    });

    sse.addEventListener("error", (err) => {
      addLog(`⚠️ Connection Error`);
      setIsConnected(false);
    });

    return () => {
      sse.close();
    };
  }, [orderId]);

  return { status, isConnected, logs };
};
