import * as React from 'react';
import { Provider } from 'react-redux';
import { MemoryRouterProps } from 'react-router';
import { MemoryRouter, Route, Switch } from 'react-router-dom';
import { render } from '@testing-library/react';

import { ThemeProvider } from 'navigader/components';
import store from 'navigader/store';
import { AppRoutes } from '../../../App';


export const renderAppRoute = (startingPages: string | string[], startingIndex: number = 0) => {
  const routerProps = {
    initialEntries: Array.isArray(startingPages) ? startingPages : [startingPages],
    initialIndex: startingIndex
  } as MemoryRouterProps;
  
  return render(
    <Provider store={store}>
      <MemoryRouter {...routerProps}>
        <AppRoutes />
      </MemoryRouter>
    </Provider>
  );
};

/**
 * Renders a React Element wrapped in some context-providers that many components in the application
 * rely upon in order to render
 *
 * @param {ReactElement} Element: the Element to render
 */
export const renderContextDependentComponent = (Element: React.ReactElement) => {
  return render(
    <Provider store={store}>
      <MemoryRouter initialEntries={['testingPath']}>
        <ThemeProvider>
          <Switch>
            <Route path="testingPath" render={() => Element} />
          </Switch>
        </ThemeProvider>
      </MemoryRouter>
    </Provider>
  );
};
