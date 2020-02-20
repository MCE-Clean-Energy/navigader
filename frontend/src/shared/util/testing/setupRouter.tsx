import React from 'react';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter } from 'react-router-dom';
import { render } from '@testing-library/react';

import { AppRoutes } from '../../../App';


export const setupRouter = (startingPage?: string) => {
  const routerProps = {} as MemoryRouterProps;
  if (startingPage) {
    routerProps.initialEntries = [startingPage];
  }
  
  return render(
      <MemoryRouter {...routerProps}>
        <AppRoutes />
      </MemoryRouter>
    );
};
