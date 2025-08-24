import { create } from 'zustand';
import type { Notification } from '../types/type.notification';

type State = {
  items: Notification[];
  unread: number;
  isLoading: boolean;
  addMany: (ns: Notification[]) => void;
  add: (n: Notification) => void;
  markRead: (id: string) => void;
  markAllRead: () => void;
  reset: () => void;
  setLoading: (loading: boolean) => void;
};

export const useNotifyStore = create<State>((set, get) => ({
  items: [],
  unread: 0,
  isLoading: false,
  addMany: (ns) => {
    // Add safety check to ensure ns is an array
    if (!Array.isArray(ns)) {
      console.warn('addMany: ns is not an array:', ns);
      return;
    }

    const unreadCount = ns.filter((n) => !n.read).length;
    set((s) => ({
      items: [...ns, ...s.items].slice(0, 200),
      unread: s.unread + unreadCount,
    }));
  },
  add: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s; // avoid duplicates
      return {
        items: [n, ...s.items].slice(0, 200),
        unread: s.unread + (n.read ? 0 : 1),
      };
    }),
  markRead: (id) =>
    set((s) => {
      const wasUnread = s.items.find((x) => x.id === id && !x.read);
      return {
        items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)),
        unread: Math.max(0, s.unread - (wasUnread ? 1 : 0)),
      };
    }),
  markAllRead: () =>
    set((s) => ({
      items: s.items.map((x) => ({ ...x, read: true })),
      unread: 0,
    })),
  reset: () => set({ items: [], unread: 0 }),
  setLoading: (loading) => set({ isLoading: loading }),
}));
