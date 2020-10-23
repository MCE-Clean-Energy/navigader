import { useHistory } from 'react-router-dom';
import * as React from 'react';

import { OriginFile, RatePlan, Scenario } from 'navigader/types';
import _ from 'navigader/util/lodash';


/** ============================ Dashboard Routes ========================== */
const dashboardBase = '/dashboard';
const createScenarioBase = `${dashboardBase}/create-scenario`;
const dashboard = {
  base: dashboardBase,
  createScenario: {
    base: createScenarioBase,
    review:              `${createScenarioBase}/review`,
    selectCostFunctions: `${createScenarioBase}/select-cost-functions`,
    selectCustomers:     `${createScenarioBase}/select-customers`,
    selectDers:          `${createScenarioBase}/select-ders`
  }
};

/** ============================ Scenario Routes =========================== */
const scenario = (id: string) => `/scenario/${id}`;
scenario.compare = (ids?: string[]) => {
  const qs = ids && ids.length
    ? `?ids=${ids.join(',')}`
    : '';

  return `/scenario/compare/${qs}`;
};

const load = {
  base: '/load',
  meterGroup: (id: string) => `/load/group/${id}`
};

/** ============================ Other Routes ============================== */
const settings = '/settings';
const login = '/login';
const resetPassword = '/reset_password';
const roadmap = '/roadmap';
const upload = '/upload';
const rates = {
  base: '/rates',
  ratePlan: (id: string) => `/rates/${id}`
};
const registration = {
  signup: '/registration/signup',

  // BEWARE!! This route is referenced explicitly on the back end. Changing it
  // here without changing it there will COMPLETELY BREAK SIGN UP!
  verify: '/registration/verify'
};

/** ============================ Routes Object ============================= */
export const routes = {
  dashboard,
  load,
  login,
  rates,
  registration,
  resetPassword,
  roadmap,
  scenario,
  settings,
  upload,
};

/** ============================ Hook ====================================== */
/**
 * Provides a standardized way of navigating between pages in the application. Components that need
 * to navigate to another page can call `useRouter`, and then choose where to go from the options
 * provided in the returned object.
 */
export const useRouter = () => {
  const history = useHistory();

  return {
    dashboard: {
      base: () => history.push(routes.dashboard.base),
      createScenario: {
        base:                () => history.push(routes.dashboard.createScenario.base),
        review:              () => history.push(routes.dashboard.createScenario.review),
        selectCostFunctions: () => history.push(routes.dashboard.createScenario.selectCostFunctions),
        selectCustomers:     () => history.push(routes.dashboard.createScenario.selectCustomers),
        selectDers:          () => history.push(routes.dashboard.createScenario.selectDers),
      }
    },

    login: () => history.push(routes.login),

    originFile: (originFile?: OriginFile) => {
      if (!originFile) return;
      return (event: React.MouseEvent) => {
        // Stopping propagation prevents other callbacks up the bubble-chain from being triggered.
        // This is particularly important on the "Uploaded Files" page, where the containing
        // `Card` has a callback too.
        event.stopPropagation();
        history.push(routes.load.meterGroup(originFile.id));
      }
    },

    rates: {
      ratePlan: (ratePlan: RatePlan) => () => {
        history.push(routes.rates.ratePlan(ratePlan.id.toString()))
      }
    },
    registration: {
      signup: () => history.push(routes.registration.signup),
      verify: () => history.push(routes.registration.verify)
    },
    roadmap: () => history.push(routes.roadmap),

    scenario: {
      details: (scenario: Scenario) => () => history.push(routes.scenario(scenario.id)),
      compare: (scenarios: Scenario[]) => () => {
        history.push(routes.scenario.compare(_.map(scenarios, 'id')));
      }
    },

    settings: () => history.push(routes.settings),
    upload: () => history.push(routes.upload),

    // Special route, allowing components to link to a page using the route string. This should be
    // used as an option of last resort.
    page: (route: string) => () => history.push(route),

    // Special route, allowing components to go backwards in history
    previousPage: () => history.goBack()
  }
};
