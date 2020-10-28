import { appendQueryString } from './api';

/** ============================ Constants ================================= */
export const SUPPORT_EMAIL = 'support@navigader.com';

/** ============================ Helpers =================================== */
export function sendSupportEmail(subject?: string, body?: string) {
  window.open(appendQueryString(`mailto:${SUPPORT_EMAIL}`, { subject, body }));
}
