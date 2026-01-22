import { toast } from "@/components/ui/use-toast";
import type {
  ApiError,
  AuthResponse,
  AuthTokens,
  Order,
  RiderAvailability,
  RiderEarnings,
  RiderLocation,
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

  async getAvailability(): Promise<RiderAvailability> {
    const response = await fetch(`${this.baseUrl}/api/rider/availability/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<RiderAvailability>(response);
  }

  async setAvailability(payload: Partial<RiderAvailability>): Promise<RiderAvailability> {
    const response = await fetch(`${this.baseUrl}/api/rider/availability/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<RiderAvailability>(response);
  }

  async listAvailableOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/api/rider/orders/available/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<Order[]>(response);
  }

  async acceptOrder(orderId: number): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/rider/orders/accept/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ order_id: orderId }),
    });
    return handleResponse<Order>(response);
  }

  async updateOrderStatus(
    orderId: number,
    payload: { status: string; latitude?: string | null; longitude?: string | null }
  ): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/rider/orders/${orderId}/status/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<Order>(response);
  }

  async updateLocation(payload: {
    latitude: string | number | null;
    longitude: string | number | null;
  }): Promise<RiderLocation> {
    const response = await fetch(`${this.baseUrl}/api/rider/location/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<RiderLocation>(response);
  }

  async listEarnings(): Promise<RiderEarnings[]> {
    const response = await fetch(`${this.baseUrl}/api/rider/earnings/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<RiderEarnings[]>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, () => localStorage.getItem("access_token"));
