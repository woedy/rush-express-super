import { toast } from "@/components/ui/use-toast";
import type { ApiError, AuthResponse, AuthTokens, User } from "@/lib/types";

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
}

export const apiClient = new ApiClient(API_BASE_URL, () => localStorage.getItem("access_token"));
