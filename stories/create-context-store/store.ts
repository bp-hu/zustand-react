import { createContextStore, useCreateStore } from '../../src/index';

export const { withStore, useStore } = createContextStore(function useModel(
  {
    count,
    unit,
  }: {
    count: number;
    unit: string;
  },
  extend,
) {
  const store = useCreateStore(
    {
      count,
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

  return extend(
    store,
    {
      unit,
    },
    (state) => ({
      get countWithUnit() {
        return `${state.count} ${state.unit}`;
      },
    }),
  );
});
