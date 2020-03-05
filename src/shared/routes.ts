/**
 * Routes used on the front end by react-router-dom
 */

/** ============================ Dashboard Routes ========================== */
export const dashboard = {
  base: '/dashboard',
  runStudy: {
    get base            () { return `${dashboard.base}/run-study`; },
    get selectCustomers () { return `${dashboard.runStudy.base}/select-customers`},
    get selectDers      () { return `${dashboard.runStudy.base}/select-ders`},
    get review          () { return `${dashboard.runStudy.base}/review`}
  }
};

export const login = '/login';
export const load = '/load';
export const meterGroup = (id: string) => `/load/group/${id}`;
export const upload = '/upload';
