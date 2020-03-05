import * as React from 'react';

import { makeStylesHook } from '@nav/shared/styles';
import * as Flex from './Flex';
import { Typography } from './Typography';


/** ============================ Types ===================================== */
type PageHeaderProps = {
  title: string;
  actions?: React.ReactNode;
};

/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(theme => ({
  header: {
    marginBottom: theme.spacing(3)
  }
}));

/** ============================ Components ================================ */
export const PageHeader: React.FC<PageHeaderProps> = ({ actions, title}) => {
  const classes = useStyles();
  return (
    <Flex.Container className={classes.header} justifyContent="space-between">
      <Flex.Item>
        <Typography variant="h4">
          {title}
        </Typography>
      </Flex.Item>
      <Flex.Item>
        {actions}
      </Flex.Item>
    </Flex.Container>
  );
};
