import * as React from 'react';

import { Tooltip } from '../Tooltip';
import { Icon } from './Icon';

/** ============================ Types ===================================== */
type InfoIconProps = {
  text: string;
};

/** ============================ Components ================================ */
export const InfoIcon: React.FC<InfoIconProps> = ({ text }) => {
  return (
    <Tooltip title={text}>
      <Icon name="info" size={18} />
    </Tooltip>
  );
};
