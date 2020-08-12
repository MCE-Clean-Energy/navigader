import * as React from 'react';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemAvatar from '@material-ui/core/ListItemAvatar';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import MuiListItemText from '@material-ui/core/ListItemText';
import classNames from 'classnames';

import { makeStylesHook } from 'navigader/styles';
import { printWarning } from 'navigader/util';
import { Avatar, AvatarProps } from './Avatar';
import { Icon, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  dense?: boolean;
};

type ListItemProps = {
  button?: boolean;
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent) => void;
  selected?: boolean;
};

type ListItemIconProps = {
  children?: React.ReactElement;
  icon?: ValidIcon;
};

type ListItemAvatar = React.ComponentType<AvatarProps>;
type ListItemIcon = React.ComponentType<ListItemIconProps>;
type ListItemText = React.FC;
type ListItem = React.ComponentType<ListItemProps>;

type ListItemExport =  ListItem & {
  Avatar: ListItemAvatar;
  Icon: ListItemIcon;
  Text: ListItemText;
};

type ListExport = React.ComponentType<ListProps> & {
  Item: ListItemExport;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
    opacity: 0.5
  }
}), 'NavigaderListItem');

/** ============================ Components ================================ */
const ListItemIcon: ListItemIcon = React.forwardRef(
  (props, ref) => {
    const { children, icon } = props;

    // Only one of the `icon` and `label` props should be provided
    const hasBoth = Boolean(children && icon);
    const hasNeither = !Boolean(children || icon);
    if (hasBoth || hasNeither) {
      printWarning('`Menu` component expects one of `icon` or `label` prop');
    }

    if (icon) {
      return (
        <MuiListItemIcon ref={ref}>
          <Icon name={icon}/>
        </MuiListItemIcon>
      );
    } else if (children) {
      return <MuiListItemIcon ref={ref}>{children}</MuiListItemIcon>;
    } else {
      return null;
    }
  }
);

const ListItemAvatar: ListItemAvatar = React.forwardRef(
  (props, ref) => {
    return (
      <MuiListItemAvatar ref={ref}>
        <Avatar {...props} />
      </MuiListItemAvatar>
    );
  }
);

const ListItemText: ListItemText = ({ children }) =>
  <MuiListItemText primary={children} />;

const ListItemComponent: ListItem = React.forwardRef(
  ({ button = true, disabled, ...rest }, ref) => {
    const classes = useStyles();
    const className = classNames({
      [classes.disabled]: disabled
    });

    const listItemProps = {
      className,
      disabled,
      ...rest
    };

    if (button) {
      return <MuiListItem button {...listItemProps} ref={ref as React.RefObject<HTMLDivElement>} />;
    } else {
      return (
        <MuiListItem
          component="li"
          ref={ref as React.RefObject<HTMLLIElement>}
          {...listItemProps}
        />
        );
    }
  }
);

const ListItem: ListItemExport = Object.assign(
  ListItemComponent, {
    Avatar: ListItemAvatar,
    Icon: ListItemIcon,
    Text: ListItemText
  }
);

export const List: ListExport = Object.assign(
  React.forwardRef<HTMLUListElement, ListProps>(
    (props, ref) => <MuiList ref={ref} {...props} />
  ), {
    Item: ListItem
  }
);
