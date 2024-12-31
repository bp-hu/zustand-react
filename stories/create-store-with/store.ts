import { combine, devtools } from 'zustand/middleware';
import { createStoreHook, createStoreWith } from '../../src/index';

export const store = createStoreWith(
  devtools(
    combine(
      {
        count: 0,
      },
      (set) => ({
        inc: () => set((state) => ({ count: state.count + 1 })),
        dec: () => set((state) => ({ count: state.count - 1 })),
      }),
    ),
  ),
  (state) => ({
    get isEven() {
      return state.count % 2 === 0;
    },
  }),
);

export const useStore = createStoreHook(store);
