import * as React from 'react';

import { DERTab } from '../common';
import { FuelSwitchingConfigurationsTable } from './ConfigurationsTable';
import { FuelSwitchingStrategiesTable } from './StrategiesTable';

/** ============================ Components ================================ */
export const FuelSwitching: React.FC = () => (
  <DERTab
    ConfigurationsTable={FuelSwitchingConfigurationsTable}
    StrategiesTable={FuelSwitchingStrategiesTable}
  />
);
