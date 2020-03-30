/**
 * Checks if the application is running in a production environment
 */
export function isProduction () {
  return process.env.NODE_ENV === 'production';
}
