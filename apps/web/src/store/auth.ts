import { create } from "zustand";
import { persist } from "zustand/middleware";
import { api, updateApiToken, initApiClient } from "../lib/api";

export type AuthUser = {
  id: string;
  email: string;
  role: "BRAND" | "INFLUENCER";
  createdAt?: string;
};

type Tokens = { accessToken: string; refreshToken: string };

interface AuthState {
  user: AuthUser | null;
  accessToken: string | null;
  refreshToken: string | null;
  isLoading: boolean;
  error: string | null;

  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    email: string;
    password: string;
    role: "BRAND" | "INFLUENCER";
    name: string;
  }) => Promise<void>;
  logout: () => void;
  clearError: () => void;
}

type AuthResponse = { user: AuthUser; tokens: Tokens };

function wireClient(
  getState: () => AuthState,
  setState: (p: Partial<AuthState>) => void
) {
  updateApiToken(getState().accessToken);

  initApiClient({
    onRefresh: async () => {
      const { refreshToken } = getState();
      if (!refreshToken) return null;
      try {
        const res = await fetch(
          `${import.meta.env.VITE_API_URL ?? ""}/api/v1/auth/refresh`,
          {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ refreshToken }),
          }
        );
        if (!res.ok) return null;
        const json = (await res.json()) as { data: AuthResponse };
        const { user, tokens } = json.data;
        updateApiToken(tokens.accessToken);
        setState({ user, accessToken: tokens.accessToken, refreshToken: tokens.refreshToken });
        return tokens.accessToken;
      } catch {
        return null;
      }
    },
    onSignOut: () => {
      updateApiToken(null);
      setState({ user: null, accessToken: null, refreshToken: null });
    },
  });
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set, get) => ({
      user: null,
      accessToken: null,
      refreshToken: null,
      isLoading: false,
      error: null,

      login: async (email, password) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post<AuthResponse>("/api/v1/auth/login", { email, password });
          updateApiToken(data.tokens.accessToken);
          set({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Login failed";
          set({ error: msg });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      register: async (input) => {
        set({ isLoading: true, error: null });
        try {
          const data = await api.post<AuthResponse>("/api/v1/auth/register", input);
          updateApiToken(data.tokens.accessToken);
          set({
            user: data.user,
            accessToken: data.tokens.accessToken,
            refreshToken: data.tokens.refreshToken,
          });
        } catch (err) {
          const msg = err instanceof Error ? err.message : "Registration failed";
          set({ error: msg });
          throw err;
        } finally {
          set({ isLoading: false });
        }
      },

      logout: () => {
        const { refreshToken } = get();
        if (refreshToken) {
          api.post("/api/v1/auth/logout", { refreshToken }).catch(() => {});
        }
        updateApiToken(null);
        set({ user: null, accessToken: null, refreshToken: null, error: null });
      },

      clearError: () => set({ error: null }),
    }),
    {
      name: "ix-auth",
      partialize: (s) => ({
        user: s.user,
        accessToken: s.accessToken,
        refreshToken: s.refreshToken,
      }),
      onRehydrateStorage: () => (state, err) => {
        if (!err && state) {
          wireClient(
            () => useAuthStore.getState(),
            (p) => useAuthStore.setState(p)
          );
        }
      },
    }
  )
);

// Wire immediately for the case where storage is synchronous
wireClient(
  () => useAuthStore.getState(),
  (p) => useAuthStore.setState(p)
);
