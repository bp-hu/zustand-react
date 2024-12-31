import React from 'react';
import { store } from './store';

export function Demo() {
  const { count, inc, dec, isEven } = store.get(
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
    </div>
  );
}
