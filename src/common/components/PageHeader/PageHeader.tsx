import * as React from 'react';
import { useHistory } from 'react-router-dom';
import MuiBreadcrumbs from '@material-ui/core/Breadcrumbs';

import { makeStylesHook } from 'navigader/styles';
import _ from 'navigader/util/lodash';
import { Button } from '../Button';
import * as Flex from '../Flex';
import { Link } from '../Link';
import { Typography } from '../Typography';


/** ============================ Types ===================================== */
type Breadcrumbs = Array<[string, string] | string>;
type BreadcrumbsProps = {
  breadcrumbs?: Breadcrumbs;
};

type PageHeaderProps = BreadcrumbsProps & {
  actions?: React.ReactNode;
  title: string;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  header: {
    marginBottom: theme.spacing(2),
    paddingTop: theme.spacing(2)
  }
}), 'PageHeader');

const useBreadcrumbStyles = makeStylesHook(theme => ({
  breadcrumbsWrapper: {
    height: 48,
    paddingTop: theme.spacing(1)
  }
}), 'BreadCrumbs');

const useBackButtonStyles = makeStylesHook(theme => ({
  backButton: {
    marginRight: theme.spacing(2)
  }
}), 'BackButton');

/** ============================ Components ================================ */
const BackButton: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  const classes = useBackButtonStyles();
  const history = useHistory();

  // If there's 1 or fewer links, don't show a button
  if (!breadcrumbs) return null;
  if (breadcrumbs.length <= 1) return null;

  // Find the last link with an `href`
  const lastLink = _.findLast(breadcrumbs.slice(0, breadcrumbs.length - 1), (breadcrumb) => {
    return typeof breadcrumb !== 'string';
  });

  return lastLink
    ? <Button className={classes.backButton} icon="back" onClick={goBack} role="back-button" />
    : null;

  /** ========================== Callbacks ================================= */
  function goBack () {
    history.goBack();
  }
};

const Breadcrumbs: React.FC<BreadcrumbsProps> = ({ breadcrumbs }) => {
  const classes = useBreadcrumbStyles();

  // If there's 1 or fewer links, don't render the breadcrumbs-- the page title will suffice
  if (!breadcrumbs) return null;
  if (breadcrumbs.length <= 1) return null;

  const lastLinkIndex = breadcrumbs.length - 1;
  return (
    <Flex.Container alignItems="center" className={classes.breadcrumbsWrapper}>
      <Flex.Item>
        <BackButton breadcrumbs={breadcrumbs} />
      </Flex.Item>
      <Flex.Item>
        <MuiBreadcrumbs aria-label="breadcrumb">
          {breadcrumbs.map((breadcrumb, index) => {
            // If we've got an `href` and it isn't the last breadcrumb, render a ling
            if (Array.isArray(breadcrumb) && index !== lastLinkIndex) {
              const [text, href] = breadcrumb;
              return <Link color="inherit" key={text} to={href} variant="body2">{text}</Link>;
            }

            // Otherwise just return the text
            const text = Array.isArray(breadcrumb) ? breadcrumb[0] : breadcrumb;
            return <Typography color="textPrimary" key={text} variant="body2">{text}</Typography>;
          })}
        </MuiBreadcrumbs>
      </Flex.Item>
    </Flex.Container>
  );
};

export const PageHeader: React.FC<PageHeaderProps> = ({ actions, breadcrumbs, title }) => {
  const classes = useStyles();

  React.useEffect(() => {
    document.title = title;
  }, [title]);

  return (
    <Flex.Container direction="column">
      <Breadcrumbs breadcrumbs={breadcrumbs}/>
      <Flex.Container className={classes.header} justifyContent="space-between">
        <Flex.Item>
          <Typography data-testid="page-header" variant="h4">
            {title}
          </Typography>
        </Flex.Item>
        <Flex.Item>
          {actions}
        </Flex.Item>
      </Flex.Container>
    </Flex.Container>
  );
};
