// We import the global options as the first thing to ensure that all configurations
// are applied to all Firebase functions before they are defined or imported.
import './global-options';

import { createRestApi } from './nestjs-firebase-adapter';

// Add here your triggers exports
export * from './cats/functions';

// Remove this line in case the application
// does not require the implementation of rest api.
export const api = createRestApi(() => import('./api.module'));
