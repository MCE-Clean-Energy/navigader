import * as React from 'react';
import AddIcon from '@material-ui/icons/Add';
import ArrowBack from '@material-ui/icons/ArrowBack';
import BatteryChargingFull from '@material-ui/icons/BatteryChargingFull';
import CreateIcon from '@material-ui/icons/Create';
import DoneIcon from '@material-ui/icons/Done';
import DeleteIcon from '@material-ui/icons/Delete';
import FeedbackIcon from '@material-ui/icons/Feedback';
import MoreVert from '@material-ui/icons/MoreVert';
import Schedule from '@material-ui/icons/Schedule';
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
  | 'back'
  | 'battery'
  | 'checkMark'
  | 'clock'
  | 'feedback'
  | 'pencil'
  | 'plus'
  | 'sun'
  | 'trash'
  | 'verticalDots';

export type IconProps = {
  color?: IconColor | MaterialColor;
  name: ValidIcon;
  size?: 'small' | 'medium' | 'large';
};

/** ============================ Components ================================ */
export const Icon: React.ComponentType<IconProps> = React.forwardRef<SVGSVGElement, IconProps>(
  ({ color, name, size, ...rest }, ref) => {
    const IconComponent = iconMap[name];
    const colorProps = isMaterialColor(color)
      ? { style: { color: materialColors[color][500] }}
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
  clock: Schedule,
  feedback: FeedbackIcon,
  pencil: CreateIcon,
  plus: AddIcon,
  sun: WbSunny,
  trash: DeleteIcon,
  verticalDots: MoreVert
};

function isMaterialColor (color?: IconColor | MaterialColor): color is MaterialColor {
  return !!color && color in materialColors;
}
