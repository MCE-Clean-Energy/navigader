import * as React from 'react';
import MuiDivider from '@material-ui/core/Divider';

/** ============================ Components ================================ */
export const Divider = React.forwardRef<HTMLHRElement>((props, ref) => (
  <MuiDivider ref={ref} {...props} />
));

Divider.displayName = 'NavigaderDivider';
