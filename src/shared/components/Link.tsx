import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { TypographyProps } from './Typography';


/** ============================ Types ===================================== */
type LinkProps = {
  replace?: boolean;
  to: string;
} & Omit<TypographyProps, 'component'>;

/** ============================ Components ================================ */
export const Link: React.FC<LinkProps> = (props) => {
  return <MuiLink {...props} component={RouterLink} underline="hover" />;
};

Link.defaultProps = {
  color: 'primary'
};
