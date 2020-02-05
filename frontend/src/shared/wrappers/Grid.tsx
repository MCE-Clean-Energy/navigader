import React from 'react';
import { Grid } from '@material-ui/core';


/** ============================ Types ===================================== */
type NavigaderGridProps = {}
type NavigaderGridItemProps = {
  className?: string;
};

type NavigaderGridItem = React.FC<NavigaderGridItemProps>;
type NavigaderGridExport = React.FC<NavigaderGridProps> & {
  Item: NavigaderGridItem;
};

/** ============================ Components ================================ */
const NavigaderGrid: NavigaderGridExport = props =>
  <Grid container spacing={2} {...props} />;

const NavigaderGridItem: NavigaderGridItem = props =>
  <Grid item {...props} xs />;

/** ============================ Exports =================================== */
NavigaderGrid.Item = NavigaderGridItem;
export default NavigaderGrid;
