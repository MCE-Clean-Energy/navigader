import * as React from 'react';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { render } from '@testing-library/react';

import { AppRoutes } from '../../../App';


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

type RenderParameters = Parameters<typeof render>;
export const renderRouterDependentComponent = (Element: RenderParameters[0], options?: RenderParameters[1]) => {
  // setup a DOM element as a render target
  const container = document.createElement('div');
  document.body.appendChild(container);
  
  const renderOptions = {
    container,
    ...options
  };
  
  return render(
    <MemoryRouter initialEntries={['testingPath']}>
      <Switch>
        <Route path="testingPath" render={() => Element} />
      </Switch>
    </MemoryRouter>,
    renderOptions
  );
};
