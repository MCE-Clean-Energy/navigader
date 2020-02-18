import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';
import ListItemIcon from '@material-ui/core/ListItemIcon';
import ListItemText from '@material-ui/core/ListItemText';


/** ============================ Types ===================================== */
type NavigaderListProps = React.HTMLAttributes<HTMLUListElement> & {
  dense?: boolean;
};
type NavigaderListItemProps = {
  className?: string;
  onClick?: (event: React.MouseEvent<HTMLDivElement>) => void;
  selected?: boolean;
};
type NavigaderListItemIconProps = {
  children: React.ReactElement;
};

type NavigaderListItemText = React.FC;
type NavigaderListItemIcon = React.FC<NavigaderListItemIconProps>;
type NavigaderListItem = React.FC<NavigaderListItemProps> & {
  Icon: NavigaderListItemIcon;
  Text: NavigaderListItemText;
};
type NavigaderListExport = React.ForwardRefExoticComponent<NavigaderListProps>
  & { Item: NavigaderListItem; };

/** ============================ Components ================================ */
const NavigaderListItem: NavigaderListItem = props => <ListItem button {...props}  />;
const NavigaderListItemIcon: NavigaderListItemIcon = props => <ListItemIcon {...props} />;
const NavigaderListItemTex: NavigaderListItemText = ({ children}) =>
  <ListItemText primary={children} />;

const NavigaderList: NavigaderListExport = Object.assign(React.forwardRef<
  any,
  NavigaderListProps
>((props, ref) => <List ref={ref} {...props} />),
  { Item: NavigaderListItem});

/** ============================ Exports =================================== */
NavigaderListItem.Icon = NavigaderListItemIcon;
NavigaderListItem.Text = NavigaderListItemTex;
export default NavigaderList;
