import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { getColor, TypographyProps } from './Typography';


/** ============================ Types ===================================== */
type LinkProps = {
  download?: string;
  replace?: boolean;
  to: string;
} & Omit<TypographyProps, 'component'>;

/** ============================ Components ================================ */
export const Link: React.FC<LinkProps> = (props) => {
  const { color, download, to, ...rest } = props;
  const linkProps = {
    color: getColor(color),
    component: download ? 'a' : RouterLink,
    href: download ? to : undefined,
    to: download ? undefined : to,
    ...rest
  };
  
  return <MuiLink {...linkProps} underline="hover" />;
};

Link.defaultProps = {
  color: 'primary'
};
