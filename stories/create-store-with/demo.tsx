import React from 'react';
import { store, useStore } from './store';

export function Demo() {
  const { count, inc, dec, isEven } = useStore.get(
    'count',
    'inc',
    'dec',
    'isEven',
  );

  return (
    <div>
      <button style={{ marginRight: 4 }} onClick={inc}>
        inc
      </button>
      <button onClick={dec}>dec</button>
      <div>count: {count}</div>
      <div>isEven: {isEven ? 'true' : 'false'}</div>
      <div>count from store: {store.getState().count}</div>
    </div>
  );
}
