/**
 * Centralized location for managing the site's cookies.
 */
import Cookies from 'js-cookie';


/** ============================ Types ===================================== */
type CookieTypes = {
  authToken: string;
  csrftoken: string;
};

/** ============================ Methods =================================== */
/**
 * Removes a cookie by name.
 *
 * @param {keyof CookieTypes} name: the name of the cookie to get
 */
export function removeCookie (name: keyof CookieTypes) {
  Cookies.remove(prefixCookieName(name));
}

/**
 * Retrieves a cookie by name. Returns `undefined` if not found.
 *
 * @param {keyof CookieTypes} name: the name of the cookie to get
 */
export function getCookie <T extends keyof CookieTypes>(name: T): CookieTypes[T] | undefined {
  return Cookies.get(prefixCookieName(name));
}

/**
 * Sets a cookie.
 *
 * @param {keyof CookieTypes} name: the name of the cookie to set
 * @param {valueof CookieTypes} value: the value of the cookie
 */
export function setCookie <T extends keyof CookieTypes>(name: T, value: CookieTypes[T]) {
  Cookies.set(prefixCookieName(name), value);
}

/**
 * Helper function that prefixes a cookie name with the current environment, as specified by the
 * `REACT_APP_ENV` environment variable. This is done to support simultaneous sessions at
 * `staging.navigader.com` and `navigader.com` which share a TLD and thus share cookies
 *
 * @param {string} name: the name of the cookie
 */
function prefixCookieName (name: string) {
  const env = process.env.REACT_APP_ENV;
  return typeof env === 'undefined'
    ? name
    : [env, name].join('-');
}
