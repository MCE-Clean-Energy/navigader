import * as React from 'react';

import { DERType } from 'navigader/types';
import { Icon, ValidIcon } from '../Icon';

/** ============================ Types ===================================== */
type DERIconProps = {
  type: DERType;
};

/** ============================ Components ================================ */
export const DERIcon: React.FC<DERIconProps> = ({ type }) => <Icon name={getDERIconName(type)} />;
export function getDERIconName(type: DERType): ValidIcon {
  switch (type) {
    case 'Battery':
      return 'battery';
    // case 'EVSE':
    //   return 'ev_station';
    case 'SolarPV':
      return 'sun';
  }
}
