import * as React from 'react';

import * as api from 'navigader/api';
import { Table } from 'navigader/components';

import { ConfigurationsTable } from '../common';
import { EVSEConfigurationDialog } from './ConfigurationDialog';

/** ============================ Components ================================ */
export const EVSEConfigurationsTable: React.FC = () => {
  return (
    <ConfigurationsTable
      dataFn={(params) =>
        api.getDerConfigurations({ ...params, der_type: 'EVSE', include: 'data' })
      }
      Dialog={EVSEConfigurationDialog}
      configurationHeaders={
        <>
          <Table.Cell align="right"># EVs</Table.Cell>
          <Table.Cell align="right">EV Efficiency (miles/kWh)</Table.Cell>
          <Table.Cell align="right">EV Battery Capacity (kWh)</Table.Cell>
          <Table.Cell align="right">EV Battery Efficiency</Table.Cell>
          <Table.Cell align="right"># EVSEs</Table.Cell>
          <Table.Cell align="right">EVSE Rating (kW)</Table.Cell>
          <Table.Cell align="right">EVSE Utilization</Table.Cell>
        </>
      }
      configurationData={(configuration) => (
        <>
          <Table.Cell align="right">{configuration.data!.ev_count}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.ev_mpkwh}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.ev_capacity}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.ev_efficiency * 100}%</Table.Cell>
          <Table.Cell align="right">{configuration.data!.evse_count}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.evse_rating}</Table.Cell>
          <Table.Cell align="right">{configuration.data!.evse_utilization * 100}%</Table.Cell>
        </>
      )}
    />
  );
};
