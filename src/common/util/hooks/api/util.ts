import _ from 'lodash';
import * as React from 'react';

import { DataObject, DynamicRestParams, Maybe } from 'navigader/types';
import { omitFalsey } from 'navigader/util/omitFalsey';
import { DataTypeFilters } from './types';

/** ============================ Types ===================================== */
type AsyncFunction<T> = () => Promise<T>;

/** ============================ Hooks ===================================== */
/**
 * Hook for calling an asynchronous method
 *
 * @param {function} fn: the asynchronous function to call
 * @param {function} [callback]: a callback to execute once the function has completed
 * @param {any[]} dependencies: the dependency array
 */
export function useAsync<T>(
  fn: AsyncFunction<Maybe<T>>,
  callback?: (response: T) => void,
  dependencies: any[] = []
) {
  const [loading, setLoading] = React.useState(false);

  React.useEffect(() => {
    let shouldUpdate = true;

    // If another request is already underway, return
    if (loading) return;

    // Update loading state and begin the async call
    setLoading(true);
    fn().then((res) => {
      // If the component has not unmounted, reset the loading state and trigger the callback
      if (shouldUpdate) {
        res && callback && callback(res);
        setLoading(false);
      }
    });

    // Cleanup function that will be called on
    // 1. Unmount
    // 2. Dependency array change
    return () => {
      shouldUpdate = false;
    };
  }, dependencies); // eslint-disable-line react-hooks/exhaustive-deps

  return loading;
}

/**
 * Applies common data filters to the given model. If the model is not undefined and passes the
 * filters, returns `true`. Otherwise, returns `false`.
 *
 * @param {DataObject|undefined} model: the model to apply the filters to, if any
 * @param {DataTypeFilters|undefined} filters: the data filters, if any
 */
export function applyDataFilters(model: Maybe<DataObject>, filters: Maybe<DataTypeFilters>) {
  if (!model) return false;
  if (!filters) return true;

  if (filters.data_types) {
    const typesNeeded = _.isArray(filters.data_types) ? filters.data_types : [filters.data_types];
    const typesPresent = Object.keys(omitFalsey(model.data));
    if (!_.every(typesNeeded.map((type) => typesPresent.includes(type)))) {
      return false;
    }
  }

  if (filters.period) {
    const intervalData = model.data.default;
    if (!intervalData) return false;
    if (intervalData.period !== filters.period) return false;
  }

  return true;
}

/**
 * Applies a set of dynamic rest filters to a model, returning `true` if the model meets all of the
 * filters and `false` if any do not pass. Note that `_.every` will return `true` if an empty filter
 * object is passed in.
 *
 * @param {object} model: the model to apply the filters to
 * @param {DynamicRestParams} [params]: the dynamic rest filters to apply
 */
export function applyDynamicRestFilters(model: Maybe<object>, params?: DynamicRestParams) {
  return _.every(params?.filter, (clause, field) => {
    const value = _.get(model, field);
    switch (clause.operation) {
      case 'in':
        return _.includes(clause.value, value);
      case 'equals':
        return value === clause.value;
    }
  });
}
