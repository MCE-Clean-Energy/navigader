import * as React from 'react';
import { Provider } from 'react-redux';
import { EnhancedStore } from '@reduxjs/toolkit';
import { HookResult, renderHook } from '@testing-library/react-hooks';

import { slices } from 'navigader/store';
import { fixtures } from 'navigader/util/testing';

/** ============================ Helpers =================================== */
/**
 * Bootstraps the hook test function
 *
 * @param {EnhancedStore} store: the application store
 * @param {Function} hook: the hook to test
 * @param {ModelClassExterior[]} [models]: models to seed the store with
 * @param {Parameters} [args]: filters that can be used with the hook
 */
export async function testHook<F extends (...args: any[]) => any>(
  store: EnhancedStore,
  hook: F,
  models?: slices.models.ModelClassExterior[],
  ...args: Parameters<F>
): Promise<HookResult<ReturnType<F>>> {
  // Add models to the store
  store.dispatch(slices.models.updateModels(models || []));

  // Run the hook
  const { result, waitForNextUpdate } = renderHook(() => hook(...args), {
    wrapper: ({ children }) => <Provider store={store}>{children}</Provider>,
  });

  // Wait for the async API calls to complete
  await waitForNextUpdate();
  return result;
}

/**
 * Helper for asserting that the mocked API route was called by a hook
 *
 * @param {string} route: the route that we expect a call was made to
 * @param {HookResult} result: the response from the `renderHook` function
 * @param {Function} [assertFn]: an optional function to make assertions on the hook return value
 */
export function assertAPICalled<T>(
  route: string,
  result: HookResult<T>,
  assertFn: (resp: T) => void
) {
  expect(fetchMock).toHaveBeenCalledTimes(1);
  const callArgs = fetchMock.mock.calls[0];
  expect(callArgs[0]).toContain(route);

  // Hook should return the rate
  assertFn(result.current);
}

/** ============================ Fixtures ================================== */
export const hourInterval = fixtures.makeIntervalData([
  ['2020-06-02T18:00:00', 1],
  ['2020-06-02T19:00:00', 2],
  ['2020-06-02T20:00:00', 3],
  ['2020-06-02T21:00:00', 4],
]);
