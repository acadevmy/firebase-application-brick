import { setGlobalOptions } from 'firebase-functions/v2';

/*
  We set global options for all Firebase functions in a separate file
  to ensure these configurations are applied before any function
  is imported or defined. This is necessary because during the build process,
  imports might be resolved in an order that does not respect the intention
  of applying these global options first. By importing this file as the first thing
  in the main file (main.ts), we ensure that all functions correctly inherit
  these global settings.
 */
setGlobalOptions({
  region: 'europe-west3',
  memory: '1GiB',
  timeoutSeconds: 540,
});
