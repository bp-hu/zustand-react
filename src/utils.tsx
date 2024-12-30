import React, { createContext, memo, useContext, useEffect, useRef, type ComponentProps, type ComponentType } from 'react';

export function useUpdateEffect(effect, deps) {
  var isMounted = useRef(false);
  useEffect(function () {
    if (!isMounted.current) {
      isMounted.current = true;
    } else {
      return effect();
    }

    return function () {};
  }, deps);
};

/**
 * 提供安全的 JSON 解析
 * @param str 用于 json 解析的对象
 * @param defaultValue 解析失败的兜底值，默认为 null
 * @returns json 对象
 */
export function parseJSON(target: string | undefined, defaultValue: any = null) {
    let json = defaultValue;
    try {
      json = JSON.parse(target || '');
    } catch (_) {
      json = defaultValue;
    }
    return json;
  }

type TSelector<T, R = any> = (data: T) => R;
type TSelectorReturn<P extends TSelector<any>> = P extends TSelector<any, infer S> ? S : never;

export function createStore<PA, RT>(useExternalStore: (props: PA) => RT) {
  const Context = createContext<RT>(undefined as any);
  function Provider({
    children,
    modelProps = undefined as any
  }: {
    children: React.ReactNode;
    modelProps?: PA;
  }) {
    const store = useExternalStore(modelProps);
    return <Context.Provider value={store}>{children}</Context.Provider>;
  }

  function useStore() {
    return useContext(Context);
  }

  return {
    Provider,
    Context,
    useStore,
    withSelector<C extends ComponentType<any>, S extends TSelector<RT>>(
      selector: S,
      Component: C,
      arePropsEqual?: (prev: any, next: any) => boolean
    ) {
      const MemoComponent = memo(Component, arePropsEqual);
      return function FinalComponent(props: ComponentProps<C> & Partial<TSelectorReturn<S>>) {
        const store = useStore();
        const selectorProps = selector(store);
        return <MemoComponent {...selectorProps} {...props} />;
      };
    },
    withStore<P>(Component: ComponentType<P>, modelProps: PA | ((props: P) => PA) = (props) => props as any) {
      return function FinalComponent(props: P) {
        return (
          <Provider modelProps={typeof modelProps === 'function' ? (modelProps as any)(props) : modelProps}>
            <Component {...(props as any)} />
          </Provider>
        );
      };
    }
  };
}
