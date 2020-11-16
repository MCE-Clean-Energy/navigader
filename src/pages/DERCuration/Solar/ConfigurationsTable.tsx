import * as React from 'react';

import * as api from 'navigader/api';
import { Table } from 'navigader/components';
import { models } from 'navigader/util';

import { ConfigurationsTable } from '../common';
import { SolarConfigurationDialog } from './ConfigurationDialog';

/** ============================ Components ================================ */
export const SolarConfigurationsTable: React.FC = () => {
  return (
    <ConfigurationsTable
      dataFn={(params) =>
        api.getDerConfigurations({ ...params, der_type: 'SolarPV', include: 'data' })
      }
      Dialog={SolarConfigurationDialog}
      configurationHeaders={
        <>
          <Table.Cell align="right">ZIP</Table.Cell>
          <Table.Cell align="right">Array Type</Table.Cell>
          <Table.Cell align="right">Azimuth</Table.Cell>
          <Table.Cell align="right">Tilt</Table.Cell>
          <Table.Cell align="right">Losses</Table.Cell>
          <Table.Cell align="right">System Capacity (kW)</Table.Cell>
        </>
      }
      configurationData={(configuration) => (
        <>
          <Table.Cell align="right">{configuration.data!.address}</Table.Cell>
          <Table.Cell align="right">
            {models.der.renderSolarArrayType(configuration.data!.array_type)}
          </Table.Cell>
          <Table.Cell align="right">{configuration.data!.azimuth}&deg;</Table.Cell>
          <Table.Cell align="right">{configuration.data!.tilt}&deg;</Table.Cell>
          <Table.Cell align="right">{configuration.data!.losses}%</Table.Cell>
          <Table.Cell align="right">{configuration.data!.system_capacity}</Table.Cell>
        </>
      )}
    />
  );
};
