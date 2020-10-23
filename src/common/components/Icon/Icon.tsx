import * as React from 'react';
import SvgIcon from '@material-ui/core/SvgIcon';
import AccountIcon from '@material-ui/icons/AccountCircle';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import BatteryChargingFull from '@material-ui/icons/BatteryChargingFull';
import ChevronLeftIcon from '@material-ui/icons/ChevronLeft';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import EvStation from '@material-ui/icons/EvStation';
import FeedbackIcon from '@material-ui/icons/Feedback';
import InfoIcon from '@material-ui/icons/Info';
import LaunchIcon from '@material-ui/icons/Launch';
import MenuIcon from '@material-ui/icons/Menu';
import MoreVert from '@material-ui/icons/MoreVert';
import Schedule from '@material-ui/icons/Schedule';
import SystemUpdateAltIcon from '@material-ui/icons/SystemUpdateAlt';
import WbSunny from '@material-ui/icons/WbSunny';

import { MaterialColor, materialColors } from 'navigader/styles';


/** ============================ Types ===================================== */
type IconColor =
  | 'inherit'
  | 'primary'
  | 'secondary'
  | 'action'
  | 'disabled'
  | 'error';

export type ValidIcon =
  | 'account'
  | 'back'
  | 'battery'
  | 'checkMark'
  | 'chevronLeft'
  | 'clock'
  | 'download'
  | 'ev_station'
  | 'feedback'
  | 'info'
  | 'launch'
  | 'menu'
  | 'pencil'
  | 'plus'
  | 'sun'
  | 'trash'
  | 'verticalDots';

export type IconProps = {
  color?: IconColor | MaterialColor;
  name: ValidIcon;
  size?: 'small' | 'large' | number;
};

/** ============================ Components ================================ */
export const Icon: React.ComponentType<IconProps> = React.forwardRef<SVGSVGElement, IconProps>(
  function Icon ({ color, name, size, ...rest }, ref) {
    const IconComponent = iconMap[name];
    const colorProps = isMaterialColor(color)
      ? { htmlColor: materialColors[color][500] }
      : { color };

    const sizeProps = {
      'fontSize': typeof size === 'string' ? size : undefined,
      'style': typeof size === 'number' ? { fontSize: size } : undefined
    };

    return <IconComponent ref={ref} {...colorProps} {...sizeProps} {...rest} />;
  }
);

/** ============================ Helpers =================================== */
/**
 * Maps a valid icon name to the corresponding icon component
 */
const iconMap: Record<ValidIcon, typeof SvgIcon> = {
  account: AccountIcon,
  back: ArrowBack,
  battery: BatteryChargingFull,
  checkMark: DoneIcon,
  chevronLeft: ChevronLeftIcon,
  clock: Schedule,
  download: SystemUpdateAltIcon,
  ev_station: EvStation,
  feedback: FeedbackIcon,
  info: InfoIcon,
  launch: LaunchIcon,
  menu: MenuIcon,
  pencil: CreateIcon,
  plus: AddIcon,
  sun: WbSunny,
  trash: DeleteIcon,
  verticalDots: MoreVert
};

function isMaterialColor (color?: IconColor | MaterialColor): color is MaterialColor {
  return !!color && color in materialColors;
}
