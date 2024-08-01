import { AppModule } from '../../app.module';
import { createNestOnCall, createNestOnRequest } from '../../firebase-functions-adapters';

export const catOnCall = createNestOnCall(
  AppModule,
  () => import('../cats.module'),
  () => import('../handlers/cat.handler'),
);

export const catOnRequest = createNestOnRequest(
  AppModule,
  () => import('../cats.module'),
  () => import('../handlers/cat-request.handler'),
);
