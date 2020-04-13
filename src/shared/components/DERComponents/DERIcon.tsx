import * as React from 'react';

import { Icon } from '@nav/shared/components';
import { DerType } from '@nav/shared/models/der';


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
