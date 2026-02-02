import { api, API_ENDPOINTS } from "@/lib/api-client";
import { Order } from "@/types";
import React, { useEffect, useState } from "react";

export const useOrders = (role: 'customer' | 'store') => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      
      const endpoint = role === 'store' 
        ? API_ENDPOINTS.STORES.ORDERS 
        : API_ENDPOINTS.USERS.ORDERS;
        
      const response = await api.get<{ success: boolean, orders: Order[] }>(endpoint);
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
