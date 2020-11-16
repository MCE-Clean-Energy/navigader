import * as React from 'react';

import * as api from 'navigader/api';

import { StrategiesTable } from '../common';
import { BatteryStrategyDialog } from './StrategyDialog';

/** ============================ Components ================================ */
export const BatteryStrategiesTable: React.FC<{ width: number }> = (props) => (
  <StrategiesTable
    dataFn={(params) => api.getDerStrategies({ ...params, der_type: 'Battery', include: 'data' })}
    Dialog={BatteryStrategyDialog}
    width={props.width}
  />
);
