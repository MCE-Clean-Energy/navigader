import * as React from 'react';

import { DERTab } from '../common';
import { BatteryConfigurationsTable } from './ConfigurationsTable';
import { BatteryStrategiesTable } from './StrategiesTable';

/** ============================ Components ================================ */
export const Batteries: React.FC = () => (
  <DERTab
    ConfigurationsTable={BatteryConfigurationsTable}
    StrategiesTable={BatteryStrategiesTable}
  />
);
