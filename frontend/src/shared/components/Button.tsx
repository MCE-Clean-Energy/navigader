import React, { ButtonHTMLAttributes } from 'react';
import omit from 'lodash/omit';
import MuiButton from '@material-ui/core/Button';
import MuiFab from '@material-ui/core/Fab';
import MuiIconButton from '@material-ui/core/IconButton';

import { printWarning } from '@nav/shared/util';
import { Icon, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
type BaseButtonProps = ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  fab?: ValidIcon;
  icon?: boolean;
} & Pick<BaseButtonProps, 'type'>

/** ============================ Components ================================ */
export const Button: React.FC<ButtonProps> = ({ fab, icon, ...rest }) => {
  if (fab) {
    if (icon) {
      // A button can't be a FAB and an icon button at the same time
      printWarning(
        '`Button component` received both `fab` and `icon` props. At most one prop' +
        ' should be provided.'
      );
    }
    
    const fabProps = omit(rest, 'children');
    return (
      <MuiFab {...fabProps}>
        <Icon name={fab} />
      </MuiFab>
    );
  }
  
  return icon
    ? <MuiIconButton {...rest} />
    : <MuiButton variant="contained" {...rest} />;
};
