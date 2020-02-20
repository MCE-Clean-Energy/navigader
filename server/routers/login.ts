import { RequestHandler } from 'express';
import proxy from 'express-http-proxy';


/**
 * Creates the `/login` router
 *
 * @param {string} proxyUri - The URI of the BEO proxy server
 */
export default function createLoginRouter (proxyUri: string): RequestHandler {
  return proxy(proxyUri);
};
