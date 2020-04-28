import * as React from 'react';

import { Icon } from '@nav/common/components';
import { DerType } from '@nav/common/models/der';


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
