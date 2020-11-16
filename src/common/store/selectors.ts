import _ from 'lodash';
import * as React from 'react';
import { createSelectorCreator, defaultMemoize, ParametricSelector } from 'reselect';

import { RootState } from 'navigader/types';

/**
 * Overrides the default equality function of reselect's `createSelector`. They use reference
 * equality (i.e. ===) to determine if dependencies have changed, and we typically want deep
 * equality.
 */
const baseCreateSelector = createSelectorCreator(defaultMemoize, _.isEqual);

/**
 * Returns a memoized selector created with reselect. Memoizing the selector is important in cases
 * where a selector that depends on component props is going to be used by multiple components,
 * potentially simultaneously. The two components can't share the selector because the selector may
 * return different results depending on the props; hence the selector must be created independently
 * by both components, and must be memoized so that the components work with the same selector
 * throughout their lifecycle.
 *
 * Mimics the type declaration of reselect's `createSelector`.
 *
 * @param {ParametricSelector} selector1: first selector (e.g. state selector)
 * @param {ParametricSelector} selector2: second selector (e.g. component props)
 * @param {Function} combiner: function that combines the return values from the two selectors
 */
export function useMemoizedSelector<P, R1, R2, T>(
  selector1: ParametricSelector<RootState, P, R1>,
  selector2: ParametricSelector<RootState, P, R2>,
  combiner: (res1: R1, res2: R2) => T
) {
  // eslint-disable-next-line react-hooks/exhaustive-deps
  return React.useMemo(() => baseCreateSelector(selector1, selector2, combiner), []);
}
