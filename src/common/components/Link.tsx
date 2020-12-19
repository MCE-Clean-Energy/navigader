import * as React from 'react';
import { Link as RouterLink } from 'react-router-dom';
import MuiLink from '@material-ui/core/Link';
import { getColor, TypographyProps } from './Typography';

/** ============================ Types ===================================== */
type NewTabLinkProps = Omit<LinkProps, 'useAnchor'>;
type SourceListProps = Omit<NewTabLinkProps, 'to'> & { sources: string[] };
type LinkProps = React.AnchorHTMLAttributes<HTMLAnchorElement> &
  Omit<TypographyProps, 'component'> & { replace?: boolean; to: string; useAnchor?: boolean };

/** ============================ Components ================================ */
const SourceList: React.FC<SourceListProps> = ({ sources, ...rest }) => {
  return (
    <sup>
      {sources.map((source, i) => (
        <NewTabLink key={source} to={source} {...rest}>
          [{i + 1}]
        </NewTabLink>
      ))}
    </sup>
  );
};

const NewTabLink = React.forwardRef<HTMLAnchorElement, NewTabLinkProps>((props, ref) => (
  <Link {...props} ref={ref} rel="noopener noreferrer" target="_blank" useAnchor />
));

NewTabLink.displayName = 'NavigaderNewTabLink';

export const Link = Object.assign(
  React.forwardRef<HTMLAnchorElement, LinkProps>(
    ({ color = 'primary', useAnchor, to, ...rest }, ref) => {
      const linkProps = {
        color: getColor(color),
        component: useAnchor ? 'a' : RouterLink,
        href: useAnchor ? to : undefined,
        to: useAnchor ? undefined : to,
        ...rest,
      };

      return <MuiLink {...linkProps} ref={ref} underline="hover" />;
    }
  ),
  {
    displayName: 'NavigaderLink',
    NewTab: NewTabLink,
    SourceList,
  }
);
