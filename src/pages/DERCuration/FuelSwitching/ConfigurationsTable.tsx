import * as React from 'react';

import * as api from 'navigader/api';
import { Icon, Table } from 'navigader/components';
import { FuelSwitchingConfiguration } from 'navigader/types';

import { ConfigurationsTable } from '../common';

/** ============================ Components ================================ */
const BooleanIcon: React.FC<{ value: boolean }> = ({ value }) =>
  value ? <Icon color="green" name="checkMark" /> : <Icon color="red" name="close" />;

export const FuelSwitchingConfigurationsTable: React.FC = () => (
  <ConfigurationsTable
    dataFn={(params) =>
      api.getDerConfigurations({ ...params, der_type: 'FuelSwitching', include: 'data' })
    }
    configurationHeaders={
      <>
        <Table.Cell>Water Heating?</Table.Cell>
        <Table.Cell>Space Heating?</Table.Cell>
      </>
    }
    configurationData={(configuration: FuelSwitchingConfiguration) => (
      <>
        <Table.Cell>
          <BooleanIcon value={configuration.data!.water_heating} />
        </Table.Cell>
        <Table.Cell>
          <BooleanIcon value={configuration.data!.space_heating} />
        </Table.Cell>
      </>
    )}
  />
);
