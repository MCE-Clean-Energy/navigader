import * as React from 'react';
import MuiGrid from '@material-ui/core/Grid';


/** ============================ Types ===================================== */
type GridProps = {
  noMargin?: boolean;
};

type GridItemProps = {
  className?: string;
  span?: 'auto' | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12;
};

/** ============================ Components ================================ */
const GridItem: React.FC<GridItemProps> = props => <MuiGrid item {...props} xs={props.span} />;
const GridComponent: React.FC<GridProps> = ({ noMargin, ...rest }) =>
  <MuiGrid container spacing={2} style={{ margin: noMargin ? 0 : undefined }} {...rest} />;

export const Grid = Object.assign(GridComponent, { Item: GridItem });
GridItem.defaultProps = {
  span: 'auto'
};
