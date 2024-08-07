import { INestApplicationContext } from '@nestjs/common';

import { NestFirebaseResolver } from './nest-firebase-resolver';
import { LazyImport } from './types';
import { resolveLazyType } from './utilities';

export class TestNestFirebaseResolver implements NestFirebaseResolver {
  constructor(private readonly app: INestApplicationContext) {}

  public async resolveApplicationContext(): Promise<INestApplicationContext> {
    return this.app;
  }

  public async resolveLazyService<T>(
    _: INestApplicationContext,
    __: LazyImport,
    service: LazyImport<T>,
  ): Promise<T> {
    const serviceType = await resolveLazyType(service);
    return this.app.get(serviceType);
  }
}
