import { INestApplicationContext } from '@nestjs/common';

import { LazyImport } from './types';

export interface NestFirebaseResolver {
  resolveApplicationContext(moduleCls: any): Promise<INestApplicationContext>;

  resolveLazyService<T>(
    container: INestApplicationContext,
    module: LazyImport,
    service: LazyImport<T>,
  ): Promise<T>;
}
