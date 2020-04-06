/**
 * Routes used on the front end by react-router-dom
 */

/** ============================ Dashboard Routes ========================== */
export const dashboard = {
  base: '/dashboard',
  createScenario: {
    get base            () { return `${dashboard.base}/create-scenario`; },
    get selectCustomers () { return `${dashboard.createScenario.base}/select-customers`},
    get selectDers      () { return `${dashboard.createScenario.base}/select-ders`},
    get review          () { return `${dashboard.createScenario.base}/review`}
  }
};

/** ============================ Scenario Routes =========================== */
export const scenario = (id: string) => `/scenario/${id}`;
scenario.compare = '/scenario/compare/';

/** ============================ Other Routes ============================== */
export const login = '/login';
export const load = '/load';
export const meterGroup = (id: string) => `/load/group/${id}`;
export const upload = '/upload';

