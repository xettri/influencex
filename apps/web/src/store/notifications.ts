import { create } from "zustand";
import type { Notification } from "@influencex/shared";
import { api } from "@/lib/api";

interface NotificationsState {
  items: Notification[];
  unreadCount: number;
  loading: boolean;
  initialized: boolean;
  // Actions
  fetch: () => Promise<void>;
  markRead: (id: string) => Promise<void>;
  markAllRead: () => Promise<void>;
  remove: (id: string) => Promise<void>;
  startPolling: () => void;
  stopPolling: () => void;
}

let pollInterval: ReturnType<typeof setInterval> | null = null;

function visibilityAwareFetch(fetchFn: () => void) {
  const handler = () => {
    if (document.visibilityState === "visible") fetchFn();
  };
  document.addEventListener("visibilitychange", handler);
  return () => document.removeEventListener("visibilitychange", handler);
}

export const useNotificationStore = create<NotificationsState>((set, get) => {
  let cleanupVisibility: (() => void) | null = null;

  return {
    items: [],
    unreadCount: 0,
    loading: false,
    initialized: false,

    fetch: async () => {
      if (get().loading) return;
      set({ loading: true });
      try {
        const items = await api.get<Notification[]>("/api/v1/notifications");
        set({
          items,
          unreadCount: items.filter((n) => !n.read).length,
          initialized: true,
        });
      } catch {
        // Silently fail — network hiccups shouldn't break the UI
      } finally {
        set({ loading: false });
      }
    },

    markRead: async (id: string) => {
      // Optimistic update
      set((s) => {
        const items = s.items.map((n) => (n.id === id ? { ...n, read: true } : n));
        return { items, unreadCount: items.filter((n) => !n.read).length };
      });
      try {
        await api.patch(`/api/v1/notifications/${id}/read`, {});
      } catch {
        // Re-fetch to sync actual state on failure
        get().fetch();
      }
    },

    markAllRead: async () => {
      // Optimistic update
      set((s) => ({
        items: s.items.map((n) => ({ ...n, read: true })),
        unreadCount: 0,
      }));
      try {
        await api.patch("/api/v1/notifications/read-all", {});
      } catch {
        get().fetch();
      }
    },

    remove: async (id: string) => {
      set((s) => {
        const items = s.items.filter((n) => n.id !== id);
        return { items, unreadCount: items.filter((n) => !n.read).length };
      });
      try {
        await api.del(`/api/v1/notifications/${id}`);
      } catch {
        get().fetch();
      }
    },

    startPolling: () => {
      if (pollInterval) return; // Already polling
      get().fetch();

      pollInterval = setInterval(() => {
        if (document.visibilityState === "visible") {
          get().fetch();
        }
      }, 30_000);

      cleanupVisibility = visibilityAwareFetch(() => get().fetch());
    },

    stopPolling: () => {
      if (pollInterval) {
        clearInterval(pollInterval);
        pollInterval = null;
      }
      cleanupVisibility?.();
      cleanupVisibility = null;
    },
  };
});
