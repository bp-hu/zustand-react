import { useMemo } from 'react';
import { useStore, type StoreApi } from 'zustand';
import { type ExtractState } from './common';
import { type StoreWithSelector } from './selector';
import { createContextHook, useUpdateEffect } from './utils';

export * from './creator';
export * from './selector';
export * from './url-search-storage';

type ExtractStoreGet<T> = T extends { get: infer G } ? G : never;

function createUseStore<T extends StoreApi<any>>(store) {
  function useWrapStore(): ReturnType<typeof useStore<T>>;
  function useWrapStore<S extends (state: ExtractState<T>) => any>(
    selector: S,
  ): ReturnType<typeof useStore<T, ReturnType<S>>>;
  function useWrapStore<S extends (state: ExtractState<T>) => any>(
    selector?: S,
  ) {
    return useStore(store, selector as any);
  }

  useWrapStore.get = store.get as ExtractStoreGet<T>;
  return useWrapStore;
}

export function createStoreHook<
  T extends StoreApi<any> & {
    get: any;
  },
>(store: T) {
  return createUseStore<T>(store);
}

export function useExtendStore<
  T extends object,
  E extends object = {},
  G extends (...args: any[]) => any = () => {},
  C extends object = {},
>(
  store: StoreApi<T> & { get: G },
  depsState: E,
  computedState?: (state: T & E) => C,
) {
  useMemo(() => {
    if (depsState) {
      store.setState(depsState);
    }
  }, []);

  useUpdateEffect(() => {
    if (depsState) {
      store.setState(depsState);
    }
  }, [...Object.entries(depsState || {}).flat()]);

  return useMemo(
    () =>
      (store as unknown as StoreApi<T & E> & StoreWithSelector<T & E>).compute(
        computedState,
      ),
    [],
  );
}

const INVALID_STORE_VALUE = Object.freeze(
  new Proxy(
    {
      __isInvalidStoreValue__: true,
    },
    {
      get(_, p) {
        console.error(
          new Error(`取值 ${String(p)} 异常，请检查 Provider 是否正确包裹`),
        );
        return undefined;
      },
    },
  ),
);

export function createContextStore<
  P,
  T extends object,
  G extends object = (...args: string[]) => any,
>(
  storeCreator: (
    props: P,
    extend: typeof useExtendStore,
  ) => StoreApi<T> & { get: G },
) {
  type TFinalStore = StoreApi<T> & {
    get: G;
  };
  type TUseStore = ReturnType<typeof createUseStore<TFinalStore>>;
  const store = createContextHook((props: P) =>
    createUseStore(storeCreator(props, useExtendStore)),
  );
  const useStore: TUseStore = ((selector?) => {
    const sotreValue = store?.useStore();

    // 生产环境兜底：避免解构报错
    return sotreValue?.(selector) || INVALID_STORE_VALUE;
  }) as TUseStore;
  useStore.get = ((...props) =>
    (store?.useStore() as any)?.get(...props)) as any;

  return {
    Provider: store.Provider,
    withStore: store.withStore,
    useStore,
  };
}

export function isInvalidStore(v) {
  return v === INVALID_STORE_VALUE;
}
