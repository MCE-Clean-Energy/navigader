import * as React from 'react';
import classNames from 'classnames';

import { Branding, Card, Flex, Typography } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';

/** ============================ Styles ==================================== */
const LOGO_WIDTH = 300;
const useStyles = makeStylesHook(
  (theme) => ({
    container: {
      height: '100vh',
    },
    content: {
      marginTop: theme.spacing(6),
      maxWidth: LOGO_WIDTH,
      width: LOGO_WIDTH,
    },
    gradient: {
      width: '50%',
    },
    navigader: {
      letterSpacing: 25,
    },
    rightSide: {
      width: '50%',
    },
    rightSideCardContent: {
      height: '100%',
    },
  }),
  'UnauthenticatedPage'
);

/** ============================ Components ================================ */
export const UnauthenticatedPage: React.FC = ({ children }) => {
  const classes = useStyles();
  const gradientClasses = classNames(classes.gradient, Branding.useGradientStyles().root);

  return (
    <Flex.Container alignItems="stretch" className={classes.container}>
      <Flex.Container
        alignItems="center"
        className={gradientClasses}
        direction="column"
        justifyContent="center"
      >
        <Typography variant="h2" className={classes.navigader}>
          NAVIGADER
        </Typography>
      </Flex.Container>

      <Card className={classes.rightSide} raised>
        <Flex.Container
          alignItems="center"
          className={classes.rightSideCardContent}
          direction="column"
          justifyContent="center"
        >
          <Branding.Logo width={LOGO_WIDTH} />
          <div className={classes.content}>{children}</div>
        </Flex.Container>
      </Card>
    </Flex.Container>
  );
};
