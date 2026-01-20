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
