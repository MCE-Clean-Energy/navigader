import { getCookie } from '@nav/shared/util';


/**
 * Determines if a user is authenticated
 */
export function userIsAuthenticated () {
  return getCookie('authToken') !== undefined;
}
