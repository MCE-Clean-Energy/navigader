import React from 'react';
import Grid from '@material-ui/core/Grid';


/** ============================ Types ===================================== */
type NavigaderGridProps = {}
type NavigaderGridItemProps = {
  className?: string;
  span?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

type NavigaderGridItem = React.FC<NavigaderGridItemProps>;
type NavigaderGridExport = React.FC<NavigaderGridProps> & {
  Item: NavigaderGridItem;
};

/** ============================ Components ================================ */
const NavigaderGrid: NavigaderGridExport = props =>
  <Grid container spacing={2} {...props} />;

const NavigaderGridItem: NavigaderGridItem = props =>
  <Grid item {...props} xs={props.span} />;

NavigaderGridItem.defaultProps = {
  span: 'auto'
};

/** ============================ Exports =================================== */
NavigaderGrid.Item = NavigaderGridItem;
export default NavigaderGrid;
