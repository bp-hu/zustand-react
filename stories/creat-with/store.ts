import { combine, devtools } from 'zustand/middleware';
import { createWith } from '../../src/index';

export const store = createWith(
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
