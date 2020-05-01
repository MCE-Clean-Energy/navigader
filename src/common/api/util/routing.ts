/**
 * Takes a route and returns a function that will return the route as given if the function is
 * called without an argument, or the route with an ID appended if an argument is provided.
 *
 * @param {string} route - The base route
 */
export function appendId (route: string) {
  return (id?: number | string) => {
    return (id ? [route, id].join('/') : route).concat('/');
  };
}

const beoHost = process.env.REACT_APP_BEO_HOST;
const isSecure = process.env.REACT_APP_ENV !== 'local';
const httpProtocol = isSecure ? 'https' : 'http';

export const beoRoute = {
  restAuth: (rest: string) => `${httpProtocol}://${beoHost}/rest-auth/${rest}`,
  v1: (rest: string) => `${httpProtocol}://${beoHost}/v1/${rest}`,
};
