import * as React from 'react';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import MuiListItemText from '@material-ui/core/ListItemText';
import classNames from 'classnames';

import { makeStylesHook } from '@nav/shared/styles';
import { printWarning } from '@nav/shared/util';
import { Icon, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  dense?: boolean;
};

type ListItemProps = React.PropsWithChildren<{
  className?: string;
  disabled?: boolean;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
}>;

type ListItemIconProps = {
  children?: React.ReactElement;
  icon?: ValidIcon;
};

type ListItemText = React.FC;
type ListItemIcon = React.FC<ListItemIconProps>;
type ListItem = React.ForwardRefExoticComponent<ListItemProps> & {
  Icon: ListItemIcon;
  Text: ListItemText;
};

type ListExport = React.ForwardRefExoticComponent<ListProps> & {
  Item: ListItem;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  disabled: {
    cursor: 'default',
    pointerEvents: 'none',
    opacity: 0.5
  }
}), 'NavigaderListItem');

/** ============================ Components ================================ */
const ListItemIcon: ListItemIcon = (props, ref) => {
  const { children, icon } = props;
  
  // Only one of the `icon` and `label` props should be provided
  const hasBoth = Boolean(children && icon);
  const hasNeither = !Boolean(children || icon);
  if (hasBoth || hasNeither) {
    printWarning('`Menu` component expects one of `icon` or `label` prop');
  }
  
  if (icon) {
    return (
      <MuiListItemIcon>
        <Icon name={icon}/>
      </MuiListItemIcon>
    );
  } else if (children) {
    return <MuiListItemIcon>{children}</MuiListItemIcon>;
  } else {
    return null;
  }
};

const ListItemText: ListItemText = ({ children}) =>
  <MuiListItemText primary={children} />;

const ListItem: ListItem = Object.assign(
  React.forwardRef<HTMLDivElement, ListItemProps>(
    (props, ref) => {
      const classes = useStyles();
      const className = classNames({
        [classes.disabled]: props.disabled
      });
      
      return <MuiListItem button className={className} ref={ref} {...props}  />;
    }
  ), {
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
