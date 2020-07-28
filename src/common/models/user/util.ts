import { cookieManager } from 'navigader/util/cookies';


/**
 * Determines if a user is authenticated
 */
export function userIsAuthenticated () {
  return cookieManager.authToken !== undefined;
}
