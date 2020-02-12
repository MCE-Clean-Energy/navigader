import React from 'react';
import List from '@material-ui/core/List';
import ListItem from '@material-ui/core/ListItem';


/** ============================ Types ===================================== */
type NavigaderListProps = React.HTMLAttributes<HTMLUListElement>;
type NavigaderListItemProps = {
  className?: string;
};

type NavigaderListItem = React.FC<NavigaderListItemProps>;
type NavigaderListExport = React.FC<NavigaderListProps> & {
  Item: NavigaderListItem;
};

/** ============================ Components ================================ */
const NavigaderList: NavigaderListExport = props => <List {...props} />;
const NavigaderListItem: NavigaderListItem = props => <ListItem {...props}  />;

/** ============================ Exports =================================== */
NavigaderList.Item = NavigaderListItem;
export default NavigaderList;
