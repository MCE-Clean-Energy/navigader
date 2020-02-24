import React from 'react';
import AddIcon from '@material-ui/icons/Add';


/** ============================ Types ===================================== */
export type ValidIcon = 'add';
type IconProps = {
  name: ValidIcon;
};

/** ============================ Components ================================ */
export const Icon: React.FC<IconProps> = ({ name, ...rest }) => {
  const IconComponent = iconMap[name];
  return <IconComponent {...rest} />;
};

/** ============================ Helpers =================================== */
/**
 * Maps a valid icon name to the corresponding icon component
 */
const iconMap = {
  add: AddIcon
};
