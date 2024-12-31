import { create } from '../../src/index';

export const store = create(
  {
    count: 0,
  },
  (set) => ({
    inc: () => set((state) => ({ count: state.count + 1 })),
    dec: () => set((state) => ({ count: state.count - 1 })),
  }),
  (state) => ({
    get isEven() {
      return state.count % 2 === 0;
    },
  }),
);