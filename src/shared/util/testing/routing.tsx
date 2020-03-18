import * as React from 'react';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { render } from '@testing-library/react';

import { AppRoutes } from '../../../App';
import { ThemeProvider } from '@nav/shared/components';


export const renderAppRoute = (startingPage?: string) => {
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

/**
 * Renders a React Element wrapped in some context-providers that many components in the application
 * rely upon in order to render
 *
 * @param {ReactElement} Element: the Element to render
 */
export const renderContextDependentComponent = (Element: React.ReactElement) => {
  // setup a DOM element as a render target
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  return render(
    <MemoryRouter initialEntries={['testingPath']}>
      <ThemeProvider>
        <Switch>
          <Route path="testingPath" render={() => Element} />
        </Switch>
      </ThemeProvider>
    </MemoryRouter>,
    { container }
  );
};
