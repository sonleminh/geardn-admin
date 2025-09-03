import { create } from 'zustand';
import type { Notification } from '../types/type.notification';

type State = {
  items: Notification[];
  badge: number;
  lastReadAt: Date | null;
  isOpen: boolean;

  setOpen: (v: boolean) => void;
  add: (n: Notification) => void;
  markReadLocal: (ids: string[]) => void;
  reset: () => void;
};

export const useNotifyStore = create<State>((set, get) => ({
  items: [],
  badge: 0,
  lastReadAt: null,
  isOpen: false,

  setOpen: (v) => set({ isOpen: v }),
  add: (n) =>
    set((s) => {
      if (s.items.some((x) => x.id === n.id)) return s;
      // tăng badge chỉ khi popup ĐÓNG
      const inc = s.isOpen ? 0 : 1;
      return { items: [n, ...s.items].slice(0, 200), badge: s.badge + inc };
    }),
  markReadLocal: (ids) =>
    set((s) => ({
      items: s.items.map((i) =>
        ids.includes(i.id) ? { ...i, isRead: true } : i
      ),
    })),
  reset: () => set({ items: [], badge: 0 }),
  resetBadge: () => set({ badge: 0 }),
}));
