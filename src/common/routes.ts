import _ from 'lodash';
import * as React from 'react';
import { useHistory } from 'react-router-dom';

import { IdType, CAISORate, OriginFile, RatePlan, Scenario, SystemProfile } from 'navigader/types';

/** ============================ Dashboard Routes ========================== */
const dashboardBase = '/dashboard';
const createScenarioBase = `${dashboardBase}/create-scenario`;
const dashboard = {
  base: dashboardBase,
  createScenario: {
    base: createScenarioBase,
    review: `${createScenarioBase}/review`,
    selectCostFunctions: `${createScenarioBase}/select-cost-functions`,
    selectCustomers: `${createScenarioBase}/select-customers`,
    selectDers: `${createScenarioBase}/select-ders`,
  },
};

/** ============================ Scenario Routes =========================== */
const scenario = (id: string) => `/scenario/${id}`;
scenario.compare = (ids?: string[]) => {
  const qs = ids && ids.length ? `?ids=${ids.join(',')}` : '';

  return `/scenario/compare/${qs}`;
};

const load = {
  base: '/load',
  meterGroup: (id: string) => `/load/group/${id}`,
};

/** ============================ DER Curation ============================== */
const dersBase = '/ders';
const ders = {
  base: dersBase,
  batteries: `${dersBase}/batteries`,
  evse: `${dersBase}/evse`,
  solar: `${dersBase}/solar`,
};

/** ============================ Cost Functions ============================ */
const costBase = '/cost';
const ratesBase = `${costBase}/rates`;
const procurementBase = `${costBase}/procurement`;
const systemProfilesBase = `${costBase}/system_profiles`;
const cost = {
  base: costBase,
  rates: {
    base: ratesBase,
    ratePlan: (id: IdType) => `${ratesBase}/${id}`,
  },
  procurement: {
    base: procurementBase,
    caisoRate: (id: IdType) => `${procurementBase}/${id}`,
  },
  system_profiles: {
    base: systemProfilesBase,
    profile: (id: IdType) => `${systemProfilesBase}/${id}`,
  },
};

/** ============================ Other Routes ============================== */
const settings = '/settings';
const login = '/login';
const resetPassword = '/reset_password';
const roadmap = '/roadmap';
const upload = '/upload';
const registration = {
  signup: '/registration/signup',

  // BEWARE!! This route is referenced explicitly on the back end. Changing it
  // here without changing it there will COMPLETELY BREAK SIGN UP!
  verify: '/registration/verify',
};

/** ============================ Routes Object ============================= */
export const routes = {
  dashboard,
  ders,
  load,
  login,
  cost,
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
export const usePushRouter = routerFactory('push');
export const useRedirectRouter = routerFactory('replace');

function routerFactory(method: 'push' | 'replace') {
  return () => {
    const routerFn = useHistory()[method];
    return React.useMemo(
      () => ({
        dashboard: {
          base: () => routerFn(routes.dashboard.base),
          createScenario: {
            base: () => routerFn(routes.dashboard.createScenario.base),
            review: () => routerFn(routes.dashboard.createScenario.review),
            selectCostFunctions: () =>
              routerFn(routes.dashboard.createScenario.selectCostFunctions),
            selectCustomers: () => routerFn(routes.dashboard.createScenario.selectCustomers),
            selectDers: () => routerFn(routes.dashboard.createScenario.selectDers),
          },
        },

        ders: {
          batteries: () => routerFn(ders.batteries),
          evse: () => routerFn(ders.evse),
          solar: () => routerFn(ders.solar),
        },

        login: () => routerFn(routes.login),

        originFile: (originFile?: OriginFile) => {
          if (!originFile) return;
          return (event: React.MouseEvent) => {
            // Stopping propagation prevents other callbacks up the bubble-chain from being triggered.
            // This is particularly important on the "Uploaded Files" page, where the containing
            // `Card` has a callback too.
            event.stopPropagation();
            routerFn(routes.load.meterGroup(originFile.id));
          };
        },

        cost: {
          rates: {
            base: () => routerFn(routes.cost.rates.base),
            ratePlan: (ratePlan: RatePlan) => () => {
              routerFn(routes.cost.rates.ratePlan(ratePlan.id));
            },
          },
          procurement: {
            base: () => routerFn(routes.cost.procurement.base),
            caisoRate: (caisoRate: CAISORate) => () => {
              routerFn(routes.cost.procurement.caisoRate(caisoRate.id));
            },
          },
          system_profiles: {
            base: () => routerFn(routes.cost.system_profiles.base),
            profile: (systemProfile: SystemProfile) => () => {
              routerFn(routes.cost.system_profiles.profile(systemProfile.id));
            },
          },
        },
        registration: {
          signup: () => routerFn(routes.registration.signup),
          verify: () => routerFn(routes.registration.verify),
        },
        roadmap: () => routerFn(routes.roadmap),

        scenario: {
          details: (scenario: Scenario) => () => routerFn(routes.scenario(scenario.id)),
          compare: (scenarios: Scenario[]) => () => {
            routerFn(routes.scenario.compare(_.map(scenarios, 'id')));
          },
        },

        settings: () => routerFn(routes.settings),
        upload: () => routerFn(routes.upload),

        // Special route, allowing components to link to a page using the route string. This should be
        // used as an option of last resort.
        page: (route: string) => () => routerFn(route),
      }),
      [routerFn]
    );
  };
}
