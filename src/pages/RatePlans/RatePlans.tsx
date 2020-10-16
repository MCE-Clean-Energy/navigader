import * as React from 'react';
import { Route, Switch } from 'react-router-dom';

import * as routes from 'navigader/routes';
import { RatePlanList } from './RatePlanList';
import { RatePlanDetails } from './RatePlanDetails';


export const RatePlans = () =>
  <Switch>
    <Route path={routes.rates.ratePlan(':id')} component={RatePlanDetails} />
    <Route exact path={routes.rates.base} component={RatePlanList} />
  </Switch>;
