import { cookieManager } from '../../cookies';

/**
 * Determines if a user is authenticated
 */
export function isAuthenticated() {
  return cookieManager.authToken !== undefined;
}
