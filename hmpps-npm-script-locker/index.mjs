/**
 * @readonly
 * @enum {'RUN' | 'FORBID'}
 */
export const Status = {
  RUN: 'RUN',
  FORBID: 'FORBID',
}

/**
 * Types
 * @typedef { Record<string, Status> } Scripts
 */

/**
 * Provides information as to whether a script should be enabled or not.
 *
 * @param {Scripts} config
 * @return {Scripts} an array of eslint config objects
 */
export default function configureAllowedScripts(config) {
  return config
}
