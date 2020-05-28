import { getCookie, omitFalsey } from 'navigader/util';
import { makeQueryString, QueryParams } from './querying';


/** ============================ Types ===================================== */
// Needless to say, this is not a complete set of HTTP method types. It is the set of the ones used
// in the NavigaDER application.
type HttpMethodType = 'DELETE' | 'GET' | 'PATCH' | 'POST';
type ContentType = 'application/json' | 'multipart/form-data';

/** ============================ API Methods =============================== */
/**
 * Makes a request using the fetch API
 *
 * @param {HttpMethodType} method: the HTTP method to use for the request (e.g. GET, POST, etc)
 * @param {string} route: the LOCAL route to send the request to. I.e. this should begin with a "/"
 * @param {object} body: the body of the request. Typically this will be JSON.
 */
function makeJsonRequest (method: HttpMethodType, route: string, body?: string | FormData) {
  return fetch(route, {
    body,
    headers: getRequestHeaders('application/json'),
    method
  });
}

/**
 * Emulates a form submission using the fetch API
 *
 * @param {string} route: the route to send the request to
 * @param {object} formFields: an object mapping form data fields to their values
 */
export function makeFormPost (route: string, formFields: object) {
  return fetch(route, {
    body: objToFormData(formFields),
    headers: getRequestHeaders(),
    method: 'POST'
  });
}

/**
 * Emulates a form submission using the XHR API. This exists to support `progress` events, which
 * the fetch API can't handle.
 *
 * @param {string} route: the route to send the request to
 * @param {object} formFields: an object mapping form data fields to their values
 */
export function makeFormXhrPost (route: string, formFields: object) {
  // Make the XHR object
  const xhr = new XMLHttpRequest();
  xhr.open('POST', route);
  
  // Add headers
  getRequestHeaders().forEach((value, key) => xhr.setRequestHeader(key, value));
  
  // Send the request after a delay, so that calling code can add event listeners and modify the
  // request in whatever manner seems fitting
  Promise.resolve().then(() => xhr.send(objToFormData(formFields)));
  return xhr;
}

export function deleteRequest(route: string) {
  return makeJsonRequest('DELETE', route);
}

export function getRequest (route: string, queryParams?: QueryParams) {
  return makeJsonRequest('GET', route.concat(makeQueryString(queryParams)));
}

export function postRequest (route: string, body: object) {
  return makeJsonRequest('POST', route, JSON.stringify(body));
}

export function patchRequest (route: string, body: object) {
  return makeJsonRequest('PATCH', route, JSON.stringify(body));
}

/** ============================ Helpers =============================== */
/**
 * Produces the headers to send with a request
 *
 * @param {ContentType} contentType: the value for the 'Content-Type` header
 */
function getRequestHeaders (contentType?: ContentType) {
  const authToken = getCookie('authToken');
  return new Headers(
    omitFalsey({
      'Authorization': authToken && `Token ${authToken}`,
      'Content-Type': contentType,
      'X-CSRFToken': getCookie('csrftoken')
    })
  );
}

/**
 * Given an object, creates a FormData object with the object's keys and corresponding values as
 * fields
 *
 * @param {object} formFields: the object to convert to a FormData object
 */
function objToFormData (formFields: object) {
  const formData = new FormData();
  Object.entries(formFields).forEach(([fieldName, value]) => {
    formData.append(fieldName, value);
  });
  return formData;
}
