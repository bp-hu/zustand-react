import { parseJSON } from './utils';
import { createJSONStorage } from 'zustand/middleware';

const getUrlSearch = () => {
  return window.location.search.slice(1);
};

const getSearchParams = (searchParams: URLSearchParams) => {
  return [...searchParams.entries()].reduce((acc, [k, v]) => {
    acc[k] = v;
    return acc;
  }, {} as Record<string, any>);
};

const URL_SEARCH_STORAGE_KEY = 'url_search_storage';

export const createUrlSearchStorage = (
  props?: Partial<{
    omitKeys: string[];
    pickKeys: string[];
    replace: boolean;
    onChange: (state: Record<string, any>) => void;
  }>,
) => {
  const { onChange, replace = false, omitKeys = [], pickKeys = [] } = props || {};
  return {
    name: URL_SEARCH_STORAGE_KEY,
    storage: createJSONStorage(() => ({
      getItem: () => {
        return new Promise((resolve) => {
          setTimeout(() => {
            const searchParams = new URLSearchParams(getUrlSearch());
            resolve(
              JSON.stringify({
                state: getSearchParams(searchParams),
                version: 0,
              }),
            );
          }, 0);
        });
      },
      setItem: (_: string, newValue: any): void => {
        const newState = parseJSON(newValue)?.state || {};
        const oldSearchParams = new URLSearchParams(getUrlSearch());
        const searchParams = new URLSearchParams(replace ? undefined : getUrlSearch());
        if (pickKeys.length) {
          [...oldSearchParams.entries()]
            .filter(([k]) => pickKeys.includes(k))
            .forEach(([k, v]) => {
              searchParams.set(k, v);
            });
        }
        Object.entries<string>(newState).forEach(([k, v]) => {
          searchParams.set(k, v);
        });
        if (omitKeys.length) {
          omitKeys.forEach((k) => {
            searchParams.delete(k);
          });
        }
        onChange?.(getSearchParams(searchParams));
      },
      removeItem: (): void => {
        return undefined;
      },
    })),
  };
};
