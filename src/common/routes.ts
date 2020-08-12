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
scenario.compare = (ids?: string[]) => {
  const qs = ids && ids.length
    ? `?ids=${ids.join(',')}`
    : '';

  return `/scenario/compare/${qs}`;
};

/** ============================ Other Routes ============================== */
export const settings = '/settings';
export const login = '/login';
export const load = '/load';
export const meterGroup = (id: string) => `/load/group/${id}`;
export const resetPassword = '/reset_password';
export const roadmap = '/roadmap';
export const upload = '/upload';

export const registration = {
  signup: '/registration/signup',

  // BEWARE!! This route is referenced explicitly on the back end. Changing it
  // here without changing it there will COMPLETELY BREAK SIGN UP!
  verify: '/registration/verify'
};
