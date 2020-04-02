import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import BatteryChargingFull from '@material-ui/icons/BatteryChargingFull';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVert from '@material-ui/icons/MoreVert';
import WbSunny from '@material-ui/icons/WbSunny';


/** ============================ Types ===================================== */
export type ValidIcon = 'back' | 'battery' | 'checkMark' | 'pencil' | 'plus' | 'sun' | 'trash' | 'verticalDots';
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
  battery: BatteryChargingFull,
  checkMark: DoneIcon,
  pencil: CreateIcon,
  plus: AddIcon,
  sun: WbSunny,
  trash: DeleteIcon,
  verticalDots: MoreVert
};
