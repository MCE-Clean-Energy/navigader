import { appendQueryString } from './api';

/** ============================ Constants ================================= */
export const HELP_PAGE_URI = process.env.REACT_APP_HELP_PAGE_URI;
export const SUPPORT_EMAIL = process.env.REACT_APP_SUPPORT_EMAIL;

/** ============================ Helpers =================================== */
export function sendSupportEmail(subject?: string, body?: string) {
  window.open(appendQueryString(`mailto:${SUPPORT_EMAIL}`, { subject, body }));
}
