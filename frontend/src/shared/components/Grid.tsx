import React from 'react';
import MuiGrid from '@material-ui/core/Grid';


/** ============================ Types ===================================== */
type GridProps = {}
type GridItemProps = {
  className?: string;
  span?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

type GridItem = React.FC<GridItemProps>;
type GridExport = React.FC<GridProps> & {
  Item: GridItem;
};

/** ============================ Components ================================ */
export const Grid: GridExport = props =>
  <MuiGrid container spacing={2} {...props} />;

const GridItem: GridItem = props =>
  <MuiGrid item {...props} xs={props.span} />;

Grid.Item = GridItem;
GridItem.defaultProps = {
  span: 'auto'
};
