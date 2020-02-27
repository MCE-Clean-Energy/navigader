/**
 * Centralized location for managing the site's cookies.
 */
import Cookies from 'js-cookie';


/** ============================ Types =============================== */
type CookieTypes = {
  authToken: string;
  csrftoken: string;
};

/**
 * Retrieves a cookie by name. Returns `undefined` if not found.
 *
 * @param {keyof CookieTypes} name: the name of the cookie to get
 */
export function getCookie <T extends keyof CookieTypes>(name: T): CookieTypes[T] | undefined {
  return Cookies.get(name);
}

/**
 * Sets a cookie.
 *
 * @param {keyof CookieTypes} name: the name of the cookie to set
 * @param {valueof CookieTypes} value: the value of the cookie
 */
export function setCookie <T extends keyof CookieTypes>(name: T, value: CookieTypes[T]) {
  Cookies.set(name, value);
}
