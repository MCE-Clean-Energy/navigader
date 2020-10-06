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

/** ============================ Components ================================ */
const Text: React.FC<TextButtonProps> = props => <MuiButton {...props} />;
const Fab: React.FC<FabProps> = ({ name, ...rest }) => {
  const fabProps = _.omit(rest, 'children');
  return (
    <MuiFab {...fabProps}>
      <Icon name={name} />
    </MuiFab>
  );
};

export const Button = Object.assign(
  React.forwardRef<HTMLButtonElement, ButtonProps>(
    ({ icon, ...rest }, ref) => {
      const noChildren = React.Children.count(rest.children) === 0;

      // Render an icon-button if there's an icon but no children
      if (icon && noChildren) {
        return (
          <MuiIconButton ref={ref} {..._.omit(rest, 'size')}>
            <Icon name={icon} />
          </MuiIconButton>
        );
      }

      return (
        <MuiButton
          ref={ref}
          startIcon={icon ? <Icon name={icon} /> : null}
          variant="contained"
          {...rest}
        />
      );
    }
  ), {
    Fab,
    Text
  }
);
