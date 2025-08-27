import { create } from 'zustand';
import type { Notification } from '../types/type.notification';

type State = {
  items: Notification[];
  badge: number;
  lastReadAt: Date | null;
  isPanelOpen: boolean;

  setSnapshot: (s: {
    items: Notification[];
    unread: number;
    lastReadAt: Date | null;
  }) => void;
  // addMany: (ns: Notification[]) => void; // chỉ để merge list
  setPanelOpen: (open: boolean) => void;
  addRealtime: (n: Notification) => void;
};

export const useNotifyStore = create<State>((set, get) => ({
  items: [],
  badge: 0,
  lastReadAt: null,
  isPanelOpen: false,

  setSnapshot: ({ items, unread, lastReadAt }) =>
    set({ items, badge: unread, lastReadAt }),
  setPanelOpen: (open) => set({ isPanelOpen: open }),
  addRealtime: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s;
      const newItems = [n, ...s.items].slice(0, 200);
      if (s.isPanelOpen) {
        // không tăng badge khi panel mở
        return { items: newItems };
      }
      const last = s.lastReadAt ? s.lastReadAt.getTime() : 0;
      const isNew = new Date(n.createdAt).getTime() > last;
      return { items: newItems, badge: s.badge + (isNew ? 1 : 0) };
    }),
  // addMany: (ns) =>
  //   set((s) => {
  //     const seen = new Set(s.items.map((x) => x.id));
  //     const merged = [...ns.filter((x) => !seen.has(x.id)), ...s.items].slice(
  //       0,
  //       200
  //     );
  //     return { items: merged };
  //   }),
}));
