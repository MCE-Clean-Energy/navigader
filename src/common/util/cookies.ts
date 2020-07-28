/**
 * Centralized location for managing the site's cookies.
 */
import Cookies from 'js-cookie';


/** ============================ Types ===================================== */
type CookieType = 'authToken' | 'csrftoken';
type CookieValue = string | undefined;

/** ============================ Cookie Manager ============================ */
class CookieManager {
  /* =========================== Private methods =========================== */
  /**
   * Retrieves a cookie by name. Returns `undefined` if not found
   *
   * @param {CookieType} name: the name of the cookie to get
   */
  private static getCookie (name: CookieType) {
    return Cookies.get(CookieManager.prefix(name));
  }

  /**
   * Sets a cookie. If the provided value is `undefined` the cookie will be removed
   *
   * @param {CookieType} name: the name of the cookie to set
   * @param {CookieValue} value: the value of the cookie. If undefined the cookie is removed
   */
  private static setCookie (name: CookieType, value: CookieValue) {
    if (value === undefined) {
      CookieManager.removeCookie(name);
      return;
    }

    Cookies.set(CookieManager.prefix(name), value);
  }

  /**
   * Removes a cookie by name
   *
   * @param {CookieType} name: the name of the cookie to get
   */
  private static removeCookie (name: CookieType) {
    Cookies.remove(CookieManager.prefix(name));
  }

  /**
   * Helper function that prefixes a cookie name with the current environment, as specified by the
   * `REACT_APP_ENV` environment variable. This is done to support simultaneous sessions at
   * `staging.navigader.com` and `navigader.com` which share a TLD and thus share cookies
   *
   * @param {CookieType} name: the name of the cookie
   */
  private static prefix (name: CookieType) {
    const env = process.env.REACT_APP_ENV;
    return typeof env === 'undefined'
      ? name
      : [env, name].join('-');
    }

  /* =========================== Cookie accessors/modifiers ================ */
  get authToken () {
    return CookieManager.getCookie('authToken');
  }

  set authToken (value: CookieValue) {
    CookieManager.setCookie('authToken', value);
  }

  get csrfToken () {
    return CookieManager.getCookie('csrftoken');
  }

  set csrfToken (value: CookieValue) {
    CookieManager.setCookie('csrftoken', value);
  }

  remove = {
    authToken: () => CookieManager.removeCookie('authToken'),
    csrfToken: () => CookieManager.removeCookie('csrftoken'),
  }
}

export const cookieManager = new CookieManager();
