import React from 'react';
import MuiList from '@material-ui/core/List';
import MuiListItem from '@material-ui/core/ListItem';
import MuiListItemIcon from '@material-ui/core/ListItemIcon';
import MuiListItemText from '@material-ui/core/ListItemText';


/** ============================ Types ===================================== */
type ListProps = React.HTMLAttributes<HTMLUListElement> & {
  dense?: boolean;
};
type ListItemProps = {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
};
type ListItemIconProps = {
  children: React.ReactElement;
};

type ListItemText = React.FC;
type ListItemIcon = React.FC<ListItemIconProps>;
type ListItem = React.FC<ListItemProps> & {
  Icon: ListItemIcon;
  Text: ListItemText;
};
type ListExport = React.ForwardRefExoticComponent<ListProps> & {
  Item: ListItem;
};

/** ============================ Components ================================ */
const ListItem: ListItem = props => <MuiListItem button {...props}  />;
const ListItemIcon: ListItemIcon = props => <MuiListItemIcon {...props} />;
const ListItemText: ListItemText = ({ children}) =>
  <MuiListItemText primary={children} />;

export const List: ListExport = Object.assign(React.forwardRef<
  any,
  ListProps
>((props, ref) => <MuiList ref={ref} {...props} />),
  { Item: ListItem});

ListItem.Icon = ListItemIcon;
ListItem.Text = ListItemText;
