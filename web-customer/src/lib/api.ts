import { toast } from "@/components/ui/use-toast";
import type {
  Address,
  ApiError,
  AuthResponse,
  AuthTokens,
  ChatMessage,
  Order,
  OrderQuote,
  OrderTrackingEvent,
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

  async listAddresses(): Promise<Address[]> {
    const response = await fetch(`${this.baseUrl}/api/customer/addresses/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<Address[]>(response);
  }

  async createAddress(payload: Partial<Address>): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/api/customer/addresses/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Address>(response);
  }

  async updateAddress(id: number, payload: Partial<Address>): Promise<Address> {
    const response = await fetch(`${this.baseUrl}/api/customer/addresses/${id}/`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Address>(response);
  }

  async deleteAddress(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/customer/addresses/${id}/`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      await handleResponse(response);
    }
  }

  async quoteOrder(payload: {
    merchant_branch_id: number;
    dropoff_address_id: number;
    items: { inventory_item_id: number; quantity: number }[];
  }): Promise<OrderQuote> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/quote/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<OrderQuote>(response);
  }

  async createOrder(payload: {
    merchant_branch_id: number;
    dropoff_address_id: number;
    items: { inventory_item_id: number; quantity: number }[];
    payment_provider: string;
  }): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(response);
  }

  async confirmOrder(orderId: number, provider_reference?: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/${orderId}/confirm/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ provider_reference }),
    });
    return handleResponse<Order>(response);
  }

  async listOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/history/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<Order[]>(response);
  }

  async reorder(orderId: number): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/${orderId}/reorder/`, {
      method: "POST",
      headers: this.buildHeaders(),
    });
    return handleResponse<Order>(response);
  }

  async getTracking(orderId: number): Promise<{ order: Order; events: OrderTrackingEvent[] }> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/${orderId}/tracking/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<{ order: Order; events: OrderTrackingEvent[] }>(response);
  }

  async getChat(orderId: number): Promise<ChatMessage[]> {
    const response = await fetch(`${this.baseUrl}/api/customer/orders/${orderId}/chat/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<ChatMessage[]>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, () => localStorage.getItem("access_token"));
