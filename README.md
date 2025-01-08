# zustand-react

This package provides [zustand](https://zustand.docs.pmnd.rs/guides/tutorial-tic-tac-toe) tools for React. It is lightweight and easy to use.

```bash
npm install @bphu/zustand-react
```

> `@bphu/zustand-react` can be compatible with both zustand v5 and v4.

## Features
- TypeScript ready
- Support computed state
- Simpler selector usage
- Combine with React.Context more conveniently

## Create store

You can create a typed store with `create` function.

```tsx
import { create } from '@bphu/zustand-react';

const useStore = create({
  count: 0,
}, (set) => ({
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}));
```

You can create a typed vanilla store with `createStore` function.

```tsx
import { createStore, createStoreHook } from '@bphu/zustand-react';

const store = create({
  count: 0,
}, (set) => ({
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}));

const useStore = createStoreHook(store);
```

## Computed state

Zustand does not provide convenient derivative state syntax like Mobx. You can use `create` and `createStore` function to create a store with computed state.

```tsx
import { create } from '@bphu/zustand-react';

const useStore = create({
  count: 0,
}, (set) => ({
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}),
(state) => ({
  get double() {
    return state.count * 2;
  },
}));
```

The third parameter receives a function. The function parameter is the previously defined state, and the return value is the derivative state.

> It is recommended to declare derivative states using `getter` syntax so that derivative calculation logic can be executed only when retrieving values.

## Simpler selector usage

Zustand-react provides a more concise syntax than zustand selector. You can conveniently obtain the internal state and methods of the store through the `get` method.

```tsx
import { create } from '@bphu/zustand-react';

const useStore = create({
  count: 0,
}, (set) => ({
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}),
(state) => ({
  get double() {
    return state.count * 2;
  },
}));

function App() {
  const { count, double, inc. dec } = useStore.get('count', 'double', 'inc', 'dec');

  return ...
}
```

### Selector middleware

This `get` syntax is provided by the selector middleware. You can also use it alone in zustand to achieve the same effect.

```tsx
import { create } from 'zustand';
import { selector } from '@bphu/zustand-react';

const useStore = create(selector(() => ({
  count: 0,
  inc: () => set((state) => ({ count: state.count + 1 })),
  dec: () => set((state) => ({ count: state.count - 1 })),
}), (state) => ({
  get double() {
    return state.count * 2;
  }
})));

function App() {
  const { count, double, inc. dec } = useStore.get('count', 'double', 'inc', 'dec');

  return ...
}
```

## Combine with React.Context

When we need to [use props to initialize the zustand store](https://zustand.docs.pmnd.rs/guides/initialize-state-with-props), we need to use React.Context.

Zustand-react provides an out-of-the-box solution that allows you to implement corresponding functions with less code.

```tsx
import { createContextStore, useCreateStore } from '@bphu/zustand-react';

const { withStore, useStore } = createContextStore(function useModel({ defaultCount }: { defaultCount: number }) {
  return useCreateStore({
    count: defaultCount ?? 0,
  },
  (set) => ({}),
  (state) => ({
    get double() {
      return state.count * 2;
    }
  })
});

const App = withStore(function BaseApp(props: { count: number }) {
  const { count } = useStore.get('count');

  return ...
}, (props) => ({
  defaultCount: props.count,
}));
```

### State propagation

Zustand state and React State are independent of each other. But sometimes we hope to synchronize React state to the zustand store. We may write code like this.

```tsx
import { createContextStore, useCreateStore } from '@bphu/zustand-react';

const { withStore, useStore } = createContextStore(function useModel({ unit }: { unit: string }) {
  const store = useCreateStore({
    count: 0,
    unit
  });

  useEffect(() => {
    const prevUnit = store.getState().unit;
    if (prevUnit === unit) {
      store.setState({
        unit
      }));
    }
  }, [unit]);

  return store;
});
```

The code above is tedious. You can use the `extend` method provided by createContextStore to quickly implement the above function.

```tsx
import { createContextStore, useCreateStore } from '@bphu/zustand-react';

const { withStore, useStore } = createContextStore(function useModel({ unit }: { unit: string }, extend) {
  const store = useCreateStore({
    count: 0
  });

  return extend(store, {
    unit
  }, (state) => ({
    get countWithUnit() {
      return `${state.count} ${state.unit}`;
    }
  }));
});
```

The extend method receives three parameters. The first parameter is the zustand store. The second parameter is the state that needs to be passed through. The third parameter is optional and is used for the definition of derived state.

> Please ensure that the reference of the second parameter is as expected to avoid falling into an infinite loop. By default, extend internally performs a shallow comparison, but you need to ensure the reference of the properties inside the object.

## Create store with middlewares

> The `create`/`createStore`/`useCreateStore` functions are just syntactic sugar for zustand. They have the [combine](https://zustand.docs.pmnd.rs/middlewares/combine) middleware built in.

When you want to customize the middleware, you need to use the `createWith` /`createStoreWith`/`useCreateStoreWith` function.

```tsx
import { createWith, createStoreWith } from '@bphu/zustand-react';
import { devtool, persist, combine } from 'zustand/middleware';

const useStore = createWith(
  devtool(persist(combine({
    count: 0
  }, (set) => ({
    inc: () => set((state) => ({ count: state.count + 1 })),
    dec: () => set((state) => ({ count: state.count - 1 })),
  }))))
);

const store = createStoreWith(
  devtool(persist(combine({
    count: 0,
  }, (set) => ({
    inc: () => set((state) => ({ count: state.count + 1 })),
    dec: () => set((state) => ({ count: state.count - 1 })),
  }))))
);
```

## Utils

You can reference the built-in utility functions of zustand-react through `@bphu/zustand-react/utils`.

### createContextHook

This is React.Context syntactic sugar, which can help you quickly create and use Context.

```tsx
function createContextHook<PA, RT>(useExternalStore: (props: PA) => RT): {
    useStore: () => RT;
    withStore<P>(Component: React.ComponentType<...>, modelProps?: PA | ((props: P) => PA)): (props: P) => React.JSX.Element;
    withSelector<C extends React.ComponentType<...>, S extends TSelector<...>>(selector: S, Component: C, arePropsEqual?: ((prev: any, next: any) => boolean) | undefined): (props: React.ComponentProps<...> & Partial<...>) => React.JSX.Element;
    Provider: ({ children, modelProps, }: {
        children: React.ReactNode;
        modelProps?: PA | undefined;
    }) => React.JSX.Element;
    Context: React.Context<RT>;
}
```

A simple usage example：
```tsx
import { useState } from 'react';
import { createContextHook } from '@bphu/zustand-react/utils';

// create context
const { withStore, useStore } = createContextHook(function useModel({ defaultCount }: { defaultCount: number }) {
  const [count, setCount] = useState(defaultCount ?? 0);

  return {
    count,
    setCount
  };
})

// register context
const App = withStore(function BaseApp(props: { count: number }) {
  // use context
  const { count } = useStore();
  return ...
}, (props) => ({
  defaultCount: props.count,
}));

// use withSelector for performance optimization in child components
const Child = withSelector(function Child(props: { count: number }) {
  return <>{count}</>;
}, (state) => ({
  count: state.count,
});
```

## parseJSON

This function is used to parse JSON strings. It is used to solve the problem of JSON.parse throwing errors when the string is empty.

```tsx
import { parseJSON } from '@bphu/zustand-react/utils';

const str = '';
const obj = parseJSON(str, {});
```

The `parseJSON` accepts two parameters. The first parameter is the string to be parsed. The second is an optional parameter used to define the default value when parsing fails.

## useUpdateEffect

This hook is used to execute the effect when the state changes.

```tsx
import { useUpdateEffect } from '@bphu/zustand-react/utils';

export default () => {
  const [count, setCount] = useState(0);

  useUpdateEffect(() => {
    console.log('count changed');
  }, [count]);

  return <button onClick={() => setCount(c => c + 1)}>
    increase
  </button>;
  );
};
```