import * as React from 'react';

import * as api from 'navigader/api';

import { StrategiesTable } from '../common';
import { FuelSwitchingStrategyDialog } from './StrategyDialog';

/** ============================ Components ================================ */
export const FuelSwitchingStrategiesTable: React.FC<{ width: number }> = (props) => (
  <StrategiesTable
    dataFn={(params) => api.getDerStrategies({ ...params, der_type: 'FuelSwitching' })}
    Dialog={FuelSwitchingStrategyDialog}
    width={props.width}
  />
);
