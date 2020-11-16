import * as React from 'react';

import { DERTab } from '../common';
import { EVSEConfigurationsTable } from './ConfigurationsTable';
import { EVSEStrategiesTable } from './StrategiesTable';

/** ============================ Components ================================ */
export const EVSE: React.FC = () => (
  <DERTab ConfigurationsTable={EVSEConfigurationsTable} StrategiesTable={EVSEStrategiesTable} />
);
