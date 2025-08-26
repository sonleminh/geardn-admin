import { create } from 'zustand';
import type { Notification } from '../types/type.notification';

type State = {
  items: Notification[];

  badgeBase: number;
  badgeDelta: number;
  lastReadAt: Date | null;
  isLoading: boolean;

  setCounters: (c: { unread: number; lastReadAt: Date | null }) => void;
  optimisticMarkAllRead: (beforeISO: Date) => void;
  resetDelta: () => void;

  addMany: (ns: Notification[]) => void;
  add: (n: Notification) => void;
};

export const useNotifyStore = create<State>((set, get) => ({
  items: [],
  badgeBase: 0,
  badgeDelta: 0,
  lastReadAt: null,
  isLoading: false,

  setCounters: (c) => set({ badgeBase: c.unread, lastReadAt: c.lastReadAt }),
  optimisticMarkAllRead: (beforeISO) =>
    set({ lastReadAt: beforeISO, badgeBase: 0, badgeDelta: 0 }),

  resetDelta: () => set({ badgeDelta: 0 }),

  addMany: (ns) =>
    set((s) => {
      if (!Array.isArray(ns) || ns.length === 0) return s;
      const seen = new Set(s.items.map((x) => x.id));
      const merged = [...ns.filter((x) => !seen.has(x.id)), ...s.items].slice(
        0,
        200
      );
      return { items: merged };
    }),
  add: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s;
      const last = s.lastReadAt ? new Date(s.lastReadAt).getTime() : 0;
      const isNew = new Date(n.createdAt).getTime() > last;
      return {
        items: [n, ...s.items].slice(0, 200),
        badgeDelta: s.badgeDelta + (isNew ? 1 : 0), // cộng tạm
      };
    }),
}));
