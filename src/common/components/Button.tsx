import * as React from 'react';
import MuiButton from '@material-ui/core/Button';
import MuiFab from '@material-ui/core/Fab';
import MuiIconButton from '@material-ui/core/IconButton';

import _ from 'navigader/util/lodash';
import { Icon, IconProps, ValidIcon } from './Icon';


/** ============================ Types ===================================== */
type BaseButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement>;
type ButtonProps = React.HTMLAttributes<HTMLButtonElement> & {
  color?: 'primary' | 'secondary';
  disabled?: boolean;
  icon?: ValidIcon;
  size?: 'small' | 'large';
} & Pick<BaseButtonProps, 'type'>;

type TextButtonProps = Omit<ButtonProps, 'type'>;
type FabProps = TextButtonProps & IconProps;
type Button = React.FC<ButtonProps> & {
  Fab: React.FC<FabProps>;
  Text: React.FC<TextButtonProps>;
};

/** ============================ Components ================================ */
export const Button: Button = ({ icon, ...rest }) => {
  const noChildren = React.Children.count(rest.children) === 0;
  
  // Render an icon-button if there's an icon but no children
  if (icon && noChildren) {
    return (
      <MuiIconButton {..._.omit(rest, 'size')}>
        <Icon name={icon} />
      </MuiIconButton>
    );
  }
  
  return (
    <MuiButton
      startIcon={icon ? <Icon name={icon} /> : null}
      variant="contained"
      {...rest}
    />
  );
};

Button.Fab = ({ name, ...rest }) => {
  const fabProps = _.omit(rest, 'children');
  return (
    <MuiFab {...fabProps}>
      <Icon name={name} />
    </MuiFab>
  );
};

Button.Text = props => <MuiButton {...props} />;
