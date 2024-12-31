import React from 'react';
import { useStore, withStore } from './store';

export const Demo = withStore(
  function BaseDemo(_: { count: number; unit: string }) {
    const { count, inc, dec, isEven, unit, countWithUnit } = useStore.get(
      'count',
      'inc',
      'dec',
      'isEven',
      'unit',
      'countWithUnit',
    );

    return (
      <div>
        <button style={{ marginRight: 4 }} onClick={inc}>
          inc
        </button>
        <button onClick={dec}>dec</button>
        <div>
          count: {count} {unit}
        </div>
        <div>isEven: {isEven ? 'true' : 'false'}</div>
        <div>countWithUnit: {countWithUnit}</div>
      </div>
    );
  },
  (props) => props,
);
