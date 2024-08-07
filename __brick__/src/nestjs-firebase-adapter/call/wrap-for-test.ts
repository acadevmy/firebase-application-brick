import { INestApplicationContext } from '@nestjs/common';
import { FeaturesList } from 'firebase-functions-test/lib/features';

import { TestNestFirebaseResolver } from '../test-nest-firebase-resolver';
import { NestOnCall } from './nest-on-call';
import { WrappedNestOnCall } from './wrapped-nest-on-call';

export const wrapNestOnCallForTest = (
  firebaseMock: FeaturesList,
  app: INestApplicationContext,
  nestOnCall: NestOnCall,
): WrappedNestOnCall => {
  nestOnCall.nestFirebaseResolver = new TestNestFirebaseResolver(app);

  return firebaseMock.wrap(nestOnCall);
};
