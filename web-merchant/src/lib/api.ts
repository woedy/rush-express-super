import { toast } from "@/components/ui/use-toast";
import type {
  ApiError,
  AuthResponse,
  AuthTokens,
  InventoryItem,
  MerchantAnalytics,
  MerchantBranch,
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

  async listBranches(): Promise<MerchantBranch[]> {
    const response = await fetch(`${this.baseUrl}/api/merchant/branches/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<MerchantBranch[]>(response);
  }

  async createBranch(payload: Partial<MerchantBranch>): Promise<MerchantBranch> {
    const response = await fetch(`${this.baseUrl}/api/merchant/branches/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<MerchantBranch>(response);
  }

  async updateBranch(id: number, payload: Partial<MerchantBranch>): Promise<MerchantBranch> {
    const response = await fetch(`${this.baseUrl}/api/merchant/branches/${id}/`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<MerchantBranch>(response);
  }

  async deleteBranch(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/merchant/branches/${id}/`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      await handleResponse(response);
    }
  }

  async listInventory(): Promise<InventoryItem[]> {
    const response = await fetch(`${this.baseUrl}/api/merchant/inventory/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<InventoryItem[]>(response);
  }

  async createInventory(payload: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/api/merchant/inventory/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<InventoryItem>(response);
  }

  async updateInventory(id: number, payload: Partial<InventoryItem>): Promise<InventoryItem> {
    const response = await fetch(`${this.baseUrl}/api/merchant/inventory/${id}/`, {
      method: "PATCH",
      headers: this.buildHeaders(),
      body: JSON.stringify(payload),
    });
    return handleResponse<InventoryItem>(response);
  }

  async deleteInventory(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/api/merchant/inventory/${id}/`, {
      method: "DELETE",
      headers: this.buildHeaders(),
    });
    if (!response.ok) {
      await handleResponse(response);
    }
  }

  async listOrders(): Promise<Order[]> {
    const response = await fetch(`${this.baseUrl}/api/merchant/orders/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<Order[]>(response);
  }

  async updateOrderStatus(orderId: number, status: string): Promise<Order> {
    const response = await fetch(`${this.baseUrl}/api/merchant/orders/${orderId}/status/`, {
      method: "POST",
      headers: this.buildHeaders(),
      body: JSON.stringify({ status }),
    });
    return handleResponse<Order>(response);
  }

  async getAnalytics(): Promise<MerchantAnalytics> {
    const response = await fetch(`${this.baseUrl}/api/merchant/analytics/`, {
      headers: this.buildHeaders(),
    });
    return handleResponse<MerchantAnalytics>(response);
  }
}

export const apiClient = new ApiClient(API_BASE_URL, () => localStorage.getItem("merchant_access_token"));
