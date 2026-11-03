import { create } from 'zustand';

export type MobileDrawer = 'navigation' | 'queue';

type MobileDrawerState = {
  openDrawer: MobileDrawer | null;
  toggle: (drawer: MobileDrawer) => void;
  close: () => void;
};

export const useMobileDrawerStore = create<MobileDrawerState>((set) => ({
  openDrawer: null,
  toggle: (drawer) =>
    set((state) => ({
      openDrawer: state.openDrawer === drawer ? null : drawer,
    })),
  close: () => set({ openDrawer: null }),
}));
