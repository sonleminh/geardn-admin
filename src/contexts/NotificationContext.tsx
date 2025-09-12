import { create } from 'zustand';

type State = {
  isOpen: boolean;

  setOpen: (v: boolean) => void;
};

export const useNotifyStore = create<State>((set) => ({
  isOpen: false,
  setOpen: (v) => set({ isOpen: v }),
}));
