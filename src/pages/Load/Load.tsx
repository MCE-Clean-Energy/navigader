import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import { routes } from 'navigader/routes';
import { MeterGroupPage } from './MeterGroup';
import { UploadedFiles } from './UploadedFiles';


export const LoadPage = () =>
  <Switch>
    <Route path={routes.load.meterGroup(':id')} component={MeterGroupPage} />
    <Route exact path={routes.load.base} component={UploadedFiles} />
  </Switch>;
