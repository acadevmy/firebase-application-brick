import { INestApplicationContext } from '@nestjs/common';
import { CallableRequest } from 'firebase-functions/lib/v2/providers/https';

import { InjectLazyService } from '../types';

export interface NestCallableRequest<T> extends CallableRequest<T> {
  container: INestApplicationContext;
  injectLazyService: InjectLazyService;
}
