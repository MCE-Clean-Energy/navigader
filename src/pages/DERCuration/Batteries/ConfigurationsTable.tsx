import * as React from 'react';

import * as api from 'navigader/api';
import { Table } from 'navigader/components';

import { ConfigurationsTable } from '../common';
import { BatteryConfigurationDialog } from './ConfigurationDialog';

/** ============================ Components ================================ */
export const BatteryConfigurationsTable: React.FC = () => {
  return (
    <ConfigurationsTable
      dataFn={(params) =>
        api.getDerConfigurations({ ...params, der_type: 'Battery', include: 'data' })
      }
      Dialog={BatteryConfigurationDialog}
      configurationHeaders={
        <>
          <Table.Cell align="right">Rating (kW)</Table.Cell>
          <Table.Cell align="right">Discharge Duration (Hours)</Table.Cell>
          <Table.Cell align="right">Efficiency</Table.Cell>
        </>
      }
      configurationData={(configuration) => (
        <>
          <Table.Cell align="right">{configuration.data!.rating}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.discharge_duration_hours}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.efficiency * 100}%</Table.Cell>
        </>
      )}
    />
  );
};
