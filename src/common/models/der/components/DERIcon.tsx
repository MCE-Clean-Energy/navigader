import * as React from 'react';

import { Icon } from 'navigader/components';
import { DerType } from 'navigader/types';


/** ============================ Types ===================================== */
type DERIconProps = {
  type: DerType
};

/** ============================ Components ================================ */
export const DERIcon: React.FC<DERIconProps> = ({ type }) => {
  if (type === 'Battery') {
    return <Icon name="battery" />;
  } else {
    return null;
  }
};
