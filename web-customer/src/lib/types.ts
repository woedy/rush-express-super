export type UserRole = "CUSTOMER" | "RIDER" | "MERCHANT" | "ADMIN";

export interface UserProfile {
  phone_number?: string;
  business_name?: string;
  support_email?: string;
  kyc_status?: string;
  vehicle_type?: string;
  license_number?: string;
}

export interface User {
  id: number;
  username: string;
  email: string;
  first_name: string;
  last_name: string;
  role: UserRole;
  is_suspended: boolean;
  is_verified: boolean;
  profile?: UserProfile | null;
}

export interface AuthTokens {
  access: string;
  refresh: string;
}

export interface AuthResponse extends AuthTokens {
  user: User;
}

export interface ApiError {
  message: string;
  status?: number;
  details?: Record<string, unknown>;
}

export interface Address {
  id: number;
  label: string;
  address_line1: string;
  address_line2?: string;
  city: string;
  state?: string;
  postal_code?: string;
  country: string;
  latitude?: string | null;
  longitude?: string | null;
}

export interface OrderTrackingEvent {
  id: number;
  status: string;
  latitude?: string | null;
  longitude?: string | null;
  created_at: string;
}

export interface OrderItem {
  id: number;
  name: string;
  quantity: number;
  unit_price: string;
  inventory_item?: number | null;
}

export interface Order {
  id: number;
  status: string;
  merchant_branch: number;
  rider?: number | null;
  pickup_address_line1: string;
  pickup_address_line2?: string;
  pickup_city: string;
  pickup_state?: string;
  pickup_postal_code?: string;
  pickup_country: string;
  pickup_latitude?: string | null;
  pickup_longitude?: string | null;
  dropoff_address_line1: string;
  dropoff_address_line2?: string;
  dropoff_city: string;
  dropoff_state?: string;
  dropoff_postal_code?: string;
  dropoff_country: string;
  dropoff_latitude?: string | null;
  dropoff_longitude?: string | null;
  subtotal: string;
  delivery_fee: string;
  total: string;
  created_at: string;
  updated_at: string;
  items: OrderItem[];
}

export interface QuoteItem {
  inventory_item_id: number;
  name: string;
  quantity: number;
  unit_price: string;
}

export interface OrderQuote {
  merchant_branch_id: number;
  dropoff_address_id: number;
  items: QuoteItem[];
  subtotal: string;
  delivery_fee: string;
  total: string;
}

export interface ChatMessage {
  id: number;
  order: number;
  sender: number;
  recipient: number;
  message: string;
  created_at: string;
}
