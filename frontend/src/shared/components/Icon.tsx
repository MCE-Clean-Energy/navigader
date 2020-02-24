import React from 'react';
import AddIcon from '@material-ui/icons/Add';


/** ============================ Types ===================================== */
export type ValidIcon = 'add';
export type IconProps = {
  name: ValidIcon;
  size?: 'default' | 'small' | 'large';
};

/** ============================ Components ================================ */
export const Icon: React.FC<IconProps> = ({ name, size, ...rest }) => {
  const IconComponent = iconMap[name];
  return <IconComponent fontSize={size} {...rest} />;
};

/** ============================ Helpers =================================== */
/**
 * Maps a valid icon name to the corresponding icon component
 */
const iconMap = {
  add: AddIcon
};
