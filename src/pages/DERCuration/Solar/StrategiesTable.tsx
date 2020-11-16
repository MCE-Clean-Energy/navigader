import * as React from 'react';

import * as api from 'navigader/api';
import { Table } from 'navigader/components';
import { formatters } from 'navigader/util';

import { StrategiesTable } from '../common';
import { SolarStrategyDialog } from './StrategyDialog';

/** ============================ Components ================================ */
export const SolarStrategiesTable: React.FC<{ width: number }> = (props) => (
  <StrategiesTable
    dataFn={(params) => api.getDerStrategies({ ...params, der_type: 'SolarPV', include: 'data' })}
    Dialog={SolarStrategyDialog}
    strategyData={(strategy) => (
      <Table.Cell align="right">
        {formatters.percentage(strategy.data?.serviceable_load_ratio, 1, 1)}
      </Table.Cell>
    )}
    strategyHeaders={<Table.Cell align="right">Serviceable Load</Table.Cell>}
    width={props.width}
  />
);
