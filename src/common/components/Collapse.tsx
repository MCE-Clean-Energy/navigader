import * as React from 'react';
import MuiCollapse from '@material-ui/core/Collapse';


/** ============================ Types ===================================== */
type CollapseProps = {
  open: boolean;
  timeout?: number | 'auto';
};

/** ============================ Components ================================ */
export const Collapse: React.FC<CollapseProps> = ({ open, ...rest }) => {
  return <MuiCollapse in={open} {...rest} />
};

Collapse.defaultProps = {
  timeout: 'auto'
};
