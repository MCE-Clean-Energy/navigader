import _ from 'lodash';
import * as React from 'react';
import { useLocation } from 'react-router-dom';

import { ColorMap } from 'navigader/styles';
import { ObjectWithId, TableInterface } from 'navigader/types';

/** ============================ Hooks ===================================== */
/**
 * A custom hook that builds on `useLocation` to parse the query string. Note that `URLSearchParams`
 * is not supported by Internet Explorer (eye roll...) but there is a polyfill included from the
 * application entrypoint.
 *
 * * @param {string[]} params: the names of the query parameters of interest
 */
export function useQueryParams(params: string[]): Array<string | null> {
  const urlSearchParams = new URLSearchParams(useLocation().search);
  return params.map((param) => urlSearchParams.get(param));
}

export function useTableRef<T extends ObjectWithId>() {
  return React.useRef<TableInterface<T>>(null);
}

/**
 * Creates a color map, resetting it whenever the dependencies change
 *
 * @param {any[]} dependencies: the dependencies upon which the color map depends
 * @param {any[]} [initialElements]: initial elements to populate the map with
 */
export function useColorMap(dependencies: any[], initialElements?: any[]) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => new ColorMap(initialElements), dependencies);
}

/**
 * Wrapper around `React.useState` which provides partial state updates. The `useState` React hook
 * differs from the `React.Component`'s `setState` method in that the latter will merge the state
 * updates with the current state, while the former replaces the current state entirely. This hook
 * enables merging state updates with current state, by allowing calls to `setState` to provide
 * a partial representation of the new state.
 *
 * @param {any} initialState: the initial state provided to `React.useState`
 */
type PartialSetStateAction<T> = React.SetStateAction<Partial<T>>;
export type PartialSetStateFn<T> = React.Dispatch<PartialSetStateAction<T>>;
export function useMergeState<T>(initialState: T): [T, PartialSetStateFn<T>] {
  const [state, setState] = React.useState<T>(initialState);
  return [state, updateState];

  function updateState(newState: PartialSetStateAction<T>) {
    setState((prevState) => ({
      ...prevState,
      ...(_.isFunction(newState) ? newState(prevState) : newState),
    }));
  }
}

/**
 * Returns a memoized random string ~20 characters long.
 * Taken from https://gist.github.com/6174/6062387
 */
export function useRandomString() {
  return React.useMemo(() => {
    const firstHalf = Math.random().toString(36).substring(2, 15);
    const secondHalf = Math.random().toString(36).substring(2, 15);
    return firstHalf + secondHalf;
  }, []);
}
