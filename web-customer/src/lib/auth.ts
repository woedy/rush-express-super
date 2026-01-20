import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { AuthTokens, User } from "@/lib/types";
import { apiClient } from "@/lib/api";

interface AuthState {
  user: User | null;
  tokens: AuthTokens | null;
  isHydrated: boolean;
  setTokens: (tokens: AuthTokens | null) => void;
  setUser: (user: User | null) => void;
  hydrate: () => Promise<void>;
  logout: () => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      tokens: null,
      isHydrated: false,
      setTokens: (tokens) => {
        if (tokens) {
          localStorage.setItem("access_token", tokens.access);
          localStorage.setItem("refresh_token", tokens.refresh);
        } else {
          localStorage.removeItem("access_token");
          localStorage.removeItem("refresh_token");
        }
        set({ tokens });
      },
      setUser: (user) => set({ user }),
      hydrate: async () => {
        try {
          const user = await apiClient.me();
          set({ user, isHydrated: true });
        } catch {
          set({ user: null, isHydrated: true });
        }
      },
      logout: () => {
        get().setTokens(null);
        set({ user: null });
      },
    }),
    {
      name: "rush-express-auth",
      partialize: (state) => ({ tokens: state.tokens, user: state.user }),
    }
  )
);
