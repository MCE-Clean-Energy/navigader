import _ from 'lodash';
import * as React from 'react';
import MuiAvatar from '@material-ui/core/Avatar';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';

/** ============================ Types ===================================== */
type AvatarSize = 'default' | 'small';
export type AvatarProps = {
  className?: string;
  color?: string;
  size?: AvatarSize;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook<AvatarProps>(
  (theme) => ({
    avatar: ({ color = 'grey', size = 'default' }) => ({
      color: theme.palette.getContrastText(color),
      backgroundColor: color,
      height: sizeMap[size],
      width: sizeMap[size],
    }),
  }),
  'NavigaderAvatar'
);

const sizeMap = {
  default: 40,
  small: 24,
};

/** ============================ Components ================================ */
export const Avatar: React.ComponentType<AvatarProps> = React.forwardRef(
  ({ className, ...rest }, ref) => {
    const classes = classNames(useStyles(rest).avatar, className);
    return (
      <MuiAvatar
        className={classes}
        ref={ref as React.RefObject<HTMLDivElement>}
        {..._.omit(rest, 'color', 'size')}
      />
    );
  }
);

Avatar.displayName = 'NavigaderAvatar';
