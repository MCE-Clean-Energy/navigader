import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { routes } from 'navigader/routes';
import { MeterGroupPage } from './MeterGroup';
import { LibraryFiles } from './LibraryFiles';

export const Library = () => (
  <Switch>
    <Route path={routes.library.meterGroup(':id')} component={MeterGroupPage} />
    <Route exact path={routes.library.base} component={LibraryFiles} />
  </Switch>
);
