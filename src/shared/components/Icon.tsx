import React from 'react';
import AddIcon from '@material-ui/icons/Add';
import DoneIcon from '@material-ui/icons/Done';


/** ============================ Types ===================================== */
export type ValidIcon = 'checkMark' | 'plus';
export type IconProps = {
  name: ValidIcon;
  size?: 'small' | 'medium' | 'large';
};

/** ============================ Components ================================ */
export const Icon: React.FC<IconProps> = ({ name, size, ...rest }) => {
  const IconComponent = iconMap[name];
  return <IconComponent {...rest} />;
};

/** ============================ Helpers =================================== */
/**
 * Maps a valid icon name to the corresponding icon component
 */
const iconMap = {
  plus: AddIcon,
  checkMark: DoneIcon,
};
