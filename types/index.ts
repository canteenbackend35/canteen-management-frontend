export type OrderStatus = 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'DELIVERED' | 'CANCELLED' | 'COMPLETED';
export type UserRole = 'customer' | 'store';

export interface User {
  customer_id?: number;
  store_id?: number;
  phone_no: string;
  email: string;
  name: string;
  user_type: UserRole;
  course?: string | null;
  college?: string | null;
}

export interface Store {
  store_id: number;
  store_name: string;
  status?: string;
  phone_no?: string;
  payment_details?: string;
}

export interface MenuItem {
  menu_item_id: number;
  store_id: number;
  name: string;
  price: number;
  status: 'AVAILABLE' | 'OUT_OF_STOCK';
}

export interface OrderItem {
  item_id?: number;
  item_name?: string;
  quantity: number;
  price: number;
  menu_item?: Partial<MenuItem>;
  MenuItem?: Partial<MenuItem>;
}

export interface Order {
  order_id: number;
  customer_id: number;
  store_id: number;
  total_price: number;
  payment_id?: string;
  order_status: OrderStatus;
  order_date: string;
  order_otp?: string;
  items: OrderItem[];
  customer?: Partial<User>;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  UImessage?: string;
  data?: T;
  [key: string]: any;
}
