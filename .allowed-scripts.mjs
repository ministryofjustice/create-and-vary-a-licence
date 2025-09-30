import configureAllowedScripts from './hmpps-npm-script-locker/index.mjs'

export default configureAllowedScripts({
  'node_modules/@parcel/watcher@2.5.1': 'RUN',
  'node_modules/cypress@14.5.4': 'FORBID',
  'node_modules/dtrace-provider@0.8.8': 'RUN',
  'node_modules/fsevents@2.3.3': 'FORBID',
  'node_modules/unrs-resolver@1.11.1': 'FORBID',
})
