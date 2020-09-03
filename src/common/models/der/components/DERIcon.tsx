import * as React from 'react';

import { Icon } from 'navigader/components';
import { DERType } from 'navigader/types';


/** ============================ Types ===================================== */
type DERIconProps = {
  type: DERType
};

/** ============================ Components ================================ */
export const DERIcon: React.FC<DERIconProps> = ({ type }) => {
  switch (type) {
    case 'Battery':
      return <Icon name="battery" />;
    case 'EVSE':
      return <Icon name="ev_station" />;
    case 'SolarPV':
      return <Icon name="sun" />;
    default:
      return null;
  }
};
