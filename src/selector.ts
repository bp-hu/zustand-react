import pick from 'lodash.pick';
import { useStore, type StateCreator, type StoreApi, type StoreMutatorIdentifier } from 'zustand';
import { useShallow } from 'zustand/react/shallow';

export const COMPUTED_KEY = '__computed';

export type StoreWithSelector<T, C extends object = {}> = {
  // get 方法用于提取属性
  get: <K extends (keyof T | keyof C)[]>(...keys: K) => Pick<T & C, K[number]>;
  // compute 方法用于动态注册 computed 值
  compute: <T extends object = {}, C extends object = {}, U extends Function = () => {}>(
    this: StoreApi<T> & { compute: U },
    computedState?: (state: T) => C,
  ) => StoreApi<T> & {
    get: <K extends (keyof T | keyof C)[]>(...keys: K) => Pick<T & C, K[number]>;
    compute: U;
  };
  [COMPUTED_KEY]: (state: T) => C;
};

type SubscribeWithSelector = <
  T,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initializer: StateCreator<T, [...Mps, ['zustand-selector', never]], Mcs>,
  computedState?: (state: T) => C,
) => StateCreator<T & C, Mps, [['zustand-selector', never], ...Mcs]>;

type Write<T, U> = Omit<T, keyof U> & U;

type WithSelector<S> = S extends { getState: () => infer T } ? Write<S, StoreWithSelector<T>> : never;

declare module 'zustand/vanilla' {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  interface StoreMutators<S, A> {
    ['zustand-selector']: WithSelector<S>;
  }
}

type SelectorImpl = <T extends object>(
  storeInitializer: StateCreator<T, [], []>,
  computedState?: (state: T) => object,
) => StateCreator<T, [], []>;

const subscribeWithSelectorImpl: SelectorImpl = (fn, computedState) => (set, get, api) => {
  (api as any)[COMPUTED_KEY] = computedState;
  (api as any).get = function useSelector(...keys) {
    return useStore(
      api,
      useShallow((s: any) =>
        pick(
          {
            ...s,
            ...computedState?.(s),
          },
          keys,
        ),
      ) as any,
    );
  };

  (api as any).compute = (computed) => {
    if (computed) {
      (api as any).get = function useGet(...keys) {
        return useStore(
          api,
          useShallow((s: any) =>
            pick(
              {
                ...s,
                ...computed(s),
                ...api[COMPUTED_KEY]?.(s),
              },
              keys,
            ),
          ) as any,
        );
      } as any;

      // 更新 computed 属性，用于后续动态扩展
      const originComputed = api[COMPUTED_KEY];
      api[COMPUTED_KEY] = (s) => ({
        ...originComputed?.(s),
        ...computed(s),
      });
    }

    return api;
  };

  const initialState = fn(set, get, api);
  return initialState;
};
export const selector = subscribeWithSelectorImpl as unknown as SubscribeWithSelector;
