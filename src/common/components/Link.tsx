import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { getColor, TypographyProps } from './Typography';

/** ============================ Types ===================================== */
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<TypographyProps, 'component'> & { replace?: boolean; to: string; useAnchor?: boolean };

/** ============================ Components ================================ */
const NewTabLink = React.forwardRef<HTMLAnchorElement, LinkProps>((props, ref) => (
  <Link {...props} ref={ref} rel="noopener noreferrer" target="_blank" />
));

export const Link = Object.assign(
  React.forwardRef<HTMLAnchorElement, LinkProps>(({ color, useAnchor, to, ...rest }, ref) => {
    const linkProps = {
      color: getColor(color),
      component: useAnchor ? 'a' : RouterLink,
      href: useAnchor ? to : undefined,
      to: useAnchor ? undefined : to,
      ...rest,
    };

    return <MuiLink {...linkProps} ref={ref} underline="hover" />;
  }),
  {
    NewTab: NewTabLink,
  }
);

Link.defaultProps = {
  color: 'primary',
};
