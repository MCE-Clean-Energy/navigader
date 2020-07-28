import * as React from 'react';
import classNames from 'classnames';

import * as api from 'navigader/api';
import { Branding, Button, Card, Flex, Link, TextField, Typography } from 'navigader/components';
import { makeStylesHook } from 'navigader/styles';
import * as routes from 'navigader/routes';
import { UnauthenticatedPage } from './UnauthenticatedPage';


/** ============================ Styles ==================================== */
const useStyles = makeStylesHook(() => ({
  container: {
    height: '100vh'
  },
  gradient: {
    width: '50%'
  },
  navigader: {
    letterSpacing: 25
  }
}), 'LoginPage');

/** ============================ Components ================================ */
export const ResetPasswordPage: React.FC = () => {
  return (
    <UnauthenticatedPage>
      Yo
    </UnauthenticatedPage>
  );
};
