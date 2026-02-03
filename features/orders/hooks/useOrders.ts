import { Order } from "@/types";
import React, { useEffect, useState } from "react";
import { orderService } from "../services/orderService";

/**
 * Feature Hook: Handles fetching and refreshing orders.
 * Now uses orderService for API abstraction.
 */
export const useOrders = (role: 'customer' | 'store') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const response = await orderService.getOrders(role);
      // Backend returns { success: true, orders: [...] }
      setOrders(response.orders || []);
    } catch (err: any) {
      setError(err.message || "Failed to load orders");
      console.error(`Error fetching ${role} orders:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchOrders();
  }, []);

  useEffect(() => {
    fetchOrders();
  }, []);

  return { orders, setOrders, loading, error, refreshing, onRefresh, fetchOrders };
};
