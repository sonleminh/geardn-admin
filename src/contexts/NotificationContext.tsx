import { create } from 'zustand';
import type { Notification } from '../types/notification';

type State = {
  items: Notification[];
  unread: number;
  addMany: (ns: Notification[]) => void;
  add: (n: Notification) => void;
  markRead: (id: string) => void;
  reset: () => void;
};

export const useNotifyStore = create<State>((set, get) => ({
  items: [],
  unread: 0,
  addMany: (ns) => set((s) => ({ items: [...ns, ...s.items].slice(0, 200) })),
  add: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s; // bỏ trùng
      return { items: [n, ...s.items].slice(0, 200), unread: s.unread + 1 };
    }),
  markRead: (id) =>
    set((s) => {
      const wasUnread = s.items.find((x) => x.id === id && !x.read);
      return {
        items: s.items.map((x) => (x.id === id ? { ...x, read: true } : x)),
        unread: Math.max(0, s.unread - (wasUnread ? 1 : 0)),
      };
    }),
  reset: () => set({ items: [], unread: 0 }),
}));
