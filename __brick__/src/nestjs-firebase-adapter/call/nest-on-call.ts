import { CallableFunction } from 'firebase-functions/lib/v2/providers/https';

import { NestFirebaseResolver } from '../nest-firebase-resolver';

export interface NestOnCall extends CallableFunction<any, Promise<any>> {
  nestFirebaseResolver: NestFirebaseResolver;
}
