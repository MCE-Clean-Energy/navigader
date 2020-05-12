import * as React from 'react';
import { SvgIconProps } from '@material-ui/core/SvgIcon';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import BatteryChargingFull from '@material-ui/icons/BatteryChargingFull';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import MoreVert from '@material-ui/icons/MoreVert';
import WbSunny from '@material-ui/icons/WbSunny';

import { materialColors } from 'navigader/styles';


/** ============================ Types ===================================== */
export type ValidIcon = 'back' | 'battery' | 'checkMark' | 'pencil' | 'plus' | 'sun' | 'trash' | 'verticalDots';
export type IconProps = {
  color?: SvgIconProps['color'] | 'success';
  name: ValidIcon;
  size?: 'small' | 'medium' | 'large';
};

/** ============================ Components ================================ */
export const Icon: React.ComponentType<IconProps> = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color, name, size, ...rest }, ref) => {
    const IconComponent = iconMap[name];
    const colorProps = color === undefined
      ? {}
      : color === 'success'
        ? { style: { color: materialColors.green[500] }}
        : { color };
    
    return <IconComponent ref={ref} {...colorProps} {...rest} />;
  }
);

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
