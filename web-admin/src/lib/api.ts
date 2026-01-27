import { toast } from "@/components/ui/use-toast";
import type {
  AdminUser,
  ApiError,
  AuthResponse,
  AuthTokens,
  DeliveryFeeSetting,
  Order,
  User,
} from "@/lib/types";

const API_BASE_URL = import.meta.env.VITE_API_URL ?? "http://localhost:8000";

async function parseJson<T>(response: Response): Promise<T> {
  const text = await response.text();
  return text ? (JSON.parse(text) as T) : ({} as T);
}

async function handleResponse<T>(response: Response): Promise<T> {
  if (response.ok) {
    return parseJson<T>(response);
  }
  const data = await parseJson<Record<string, unknown>>(response);
  const error: ApiError = {
    message: (data?.detail as string) || "Request failed. Please try again.",
    status: response.status,
    details: data,
  };
  toast({
    title: "Something went wrong",
    description: error.message,
    variant: "destructive",
  });
  throw error;
}

class ApiClient {
  private baseUrl: string;
  private getAccessToken: () => string | null;

  constructor(baseUrl: string, getAccessToken: () => string | null) {
    this.baseUrl = baseUrl;
    this.getAccessToken = getAccessToken;
  }

  private buildHeaders() {
    const headers: Record<string, string> = {
      "Content-Type": "application/json",
    };
    const token = this.getAccessToken();
    if (token) {
      headers.Authorization = `Bearer ${token}`;
    }
    return headers;
  }

  async login(username: string, password: string): Promise<AuthTokens> {
    const response = await fetch(`${this.baseUrl}/auth/login/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ username, password }),
    });
    return handleResponse<AuthTokens>(response);
  }

  async register(payload: Record<string, unknown>): Promise<AuthResponse> {
    const response = await fetch(`${this.baseUrl}/auth/register/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    return handleResponse<AuthResponse>(response);
  }

  async me(): Promise<User> {
    const response = await fetch(`${this.baseUrl}/auth/me/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<User>(response);
  }

  async verifyEmail(token: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/verify-email/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token }),
    });
    return handleResponse<{ message: string }>(response);
  }

  async requestPasswordReset(email: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/password-reset/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ email }),
    });
    return handleResponse<{ message: string }>(response);
  }

  async confirmPasswordReset(token: string, new_password: string): Promise<{ message: string }> {
    const response = await fetch(`${this.baseUrl}/auth/password-reset-confirm/`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ token, new_password }),
    });
    return handleResponse<{ message: string }>(response);
  }

  async listUsers(role?: string): Promise<AdminUser[]> {
    const url = role
      ? `${this.baseUrl}/api/admin/users/?role=${encodeURIComponent(role)}`
      : `${this.baseUrl}/api/admin/users/`;
    const response = await fetch(url, {
      headers: this.buildHeaders(),
    });
    return handleResponse<AdminUser[]>(response);
  }

  async updateUserStatus(userId: number, is_suspended: boolean): Promise<AdminUser> {
    const response = await fetch(`${this.baseUrl}/api/admin/users/${userId}/status/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ is_suspended }),
    });
    return handleResponse<AdminUser>(response);
  }

  async updateRiderKyc(riderId: number, kyc_status: string): Promise<{ id: number; kyc_status: string }> {
    const response = await fetch(`${this.baseUrl}/api/admin/riders/${riderId}/kyc/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ kyc_status }),
    });
    return handleResponse<{ id: number; kyc_status: string }>(response);
  }

  async listOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/api/admin/orders/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<Order[]>(response);
  }

  async reassignOrder(orderId: number, riderId: number): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/admin/orders/${orderId}/reassign/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ rider_id: riderId }),
    });
    return handleResponse<Order>(response);
  }

  async getDeliveryFee(): Promise<DeliveryFeeSetting> {
    const response = await fetch(`${this.baseUrl}/api/admin/settings/delivery-fee/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<DeliveryFeeSetting>(response);
  }

  async updateDeliveryFee(delivery_fee: string): Promise<DeliveryFeeSetting> {
    const response = await fetch(`${this.baseUrl}/api/admin/settings/delivery-fee/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ delivery_fee }),
    });
    return handleResponse<DeliveryFeeSetting>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, () => localStorage.getItem("access_token"));
