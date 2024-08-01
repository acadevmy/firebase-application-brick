import { setGlobalOptions } from 'firebase-functions/v2';

setGlobalOptions({
  region: 'europe-west3',
  memory: '1GiB',
  timeoutSeconds: 540,
  maxInstances: 10,
  concurrency: 5,
  minInstances: 2,
});

export * from './cats';
