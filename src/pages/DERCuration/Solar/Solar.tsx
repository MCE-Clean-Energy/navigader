import * as React from 'react';

import { DERTab } from '../common';
import { SolarConfigurationsTable } from './ConfigurationsTable';
import { SolarStrategiesTable } from './StrategiesTable';

/** ============================ Components ================================ */
export const Solar: React.FC = () => (
  <DERTab ConfigurationsTable={SolarConfigurationsTable} StrategiesTable={SolarStrategiesTable} />
);
