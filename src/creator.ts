import { useMemo } from 'react';
import {
  create as baseCreate,
  createStore as baseCreateStore,
  type Mutate,
  type StateCreator,
  type StoreApi,
  type StoreMutatorIdentifier,
} from 'zustand';
import { combine } from 'zustand/middleware';
import { type ExtractState } from './common';
import { selector } from './selector';

export const createWith = <
  T extends object,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initializer: StateCreator<T, [], Mos>,
  computedState?: (store: ExtractState<Mutate<StoreApi<T>, Mos>>) => C,
) => {
  return baseCreate(selector(initializer, computedState));
};

type Write<T, U> = Omit<T, keyof U> & U;

export const create = <
  T extends object,
  U extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initialState: T,
  additionalStateCreator: StateCreator<T, Mps, Mcs, U> = () => ({}) as any,
  computedState?: (store: ExtractState<Mutate<StoreApi<Write<T, U>>, Mcs>>) => C,
) => {
  return createWith(combine(initialState, additionalStateCreator), computedState);
};

export const createStoreWith = <
  T extends ExtractState<any>,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initializer: StateCreator<T, [], Mos>,
  computedState?: (store: ExtractState<Mutate<StoreApi<T>, Mos>>) => C,
) => {
  return baseCreateStore(selector(initializer, computedState));
};

export const useCreateStoreWith = <
  T extends ExtractState<Mutate<StoreApi<any>, Mos>>,
  Mos extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initializer: StateCreator<T, [], Mos>,
  computedState?: (store: ExtractState<Mutate<StoreApi<T>, Mos>>) => C,
) => {
  return useMemo(() => createStoreWith(initializer, computedState), []);
};

export const createStore = <
  T extends object,
  U extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initialState: T = {} as any,
  additionalStateCreator: StateCreator<T, Mps, Mcs, U> = () => ({}) as any,
  computedCreator?: (state: ExtractState<Mutate<StoreApi<Write<T, U>>, Mcs>>) => C,
) => {
  return createStoreWith(combine(initialState, additionalStateCreator), computedCreator);
};

export const useCreateStore = <
  T extends object,
  U extends object,
  Mps extends [StoreMutatorIdentifier, unknown][] = [],
  Mcs extends [StoreMutatorIdentifier, unknown][] = [],
  C extends object = {},
>(
  initialState: T = {} as any,
  additionalStateCreator: StateCreator<T, Mps, Mcs, U> = () => ({}) as any,
  computedCreator?: (state: ExtractState<Mutate<StoreApi<Write<T, U>>, Mcs>>) => C,
) => {
  return useMemo(() => createStore(initialState, additionalStateCreator, computedCreator), []);
};
