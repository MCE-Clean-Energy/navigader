import { makeQueryString } from './api';


/** ============================ Constants ================================= */
export const SUPPORT_EMAIL = 'support@navigader.com';

/** ============================ Helpers =================================== */
export function sendSupportEmail (subject?: string, body?: string) {
  const queryString = makeQueryString({ subject, body });
  window.open(`mailto:${SUPPORT_EMAIL}` + queryString);
}
