import { useDispatch, useSelector } from 'react-redux';

import * as api from 'navigader/api';
import { slices } from 'navigader/store';
import { DERConfiguration, DERStrategy, Loader } from 'navigader/types';

import { useAsync } from './util';

/**
 * Loads DER strategies
 */
export function useDERStrategies(params: api.DERQueryParams): Loader<DERStrategy[]> {
  const dispatch = useDispatch();

  // Fetch the DER strategies
  const loading = useAsync(
    () => api.getDerStrategies(params),
    ({ data }) => dispatch(slices.models.updateModels(data))
  );

  const derStrategies = useSelector(slices.models.selectDERStrategies);
  return Object.assign([...derStrategies], { loading });
}

/**
 * Loads DER configurations.
 */
export function useDERConfigurations(params: api.DERQueryParams): Loader<DERConfiguration[]> {
  const dispatch = useDispatch();

  // Fetch the DER configurations
  const loading = useAsync(
    () => api.getDerConfigurations(params),
    ({ data }) => dispatch(slices.models.updateModels(data))
  );

  // Return the configurations
  const derConfigurations = useSelector(slices.models.selectDERConfigurations);
  return Object.assign([...derConfigurations], { loading });
}
