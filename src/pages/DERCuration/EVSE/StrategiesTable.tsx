import * as React from 'react';

import * as api from 'navigader/api';

import { StrategiesTable } from '../common';
import { EVSEStrategyDialog } from './StrategyDialog';

/** ============================ Components ================================ */
export const EVSEStrategiesTable: React.FC<{ width: number }> = (props) => (
  <StrategiesTable
    dataFn={(params) => api.getDerStrategies({ ...params, der_type: 'EVSE', include: 'data' })}
    Dialog={EVSEStrategyDialog}
    width={props.width}
  />
);
