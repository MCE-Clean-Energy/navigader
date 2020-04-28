import { getCookie } from '@nav/common/util';


/**
 * Determines if a user is authenticated
 */
export function userIsAuthenticated () {
  return getCookie('authToken') !== undefined;
}
