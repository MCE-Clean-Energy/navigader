import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';


/** ============================ Types ===================================== */
export type ValidIcon = 'back' | 'checkMark' | 'plus' | 'trash';
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
  back: ArrowBack,
  checkMark: DoneIcon,
  plus: AddIcon,
  trash: DeleteIcon
};
