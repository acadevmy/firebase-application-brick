import { INestApplicationContext } from '@nestjs/common';
import { LazyModuleLoader, NestFactory } from '@nestjs/core';
import { memoize } from 'lodash-es';

import { FirebaseLoggerAdapter } from './firebase-logger.adapter';
import { NestFirebaseResolver } from './nest-firebase-resolver';
import { LazyImport } from './types';
import { resolveLazyType } from './utilities';

export class DefaultNestFirebaseResolver implements NestFirebaseResolver {
  public resolveApplicationContext: (moduleCls: any) => Promise<INestApplicationContext> = memoize(
    async (moduleCls) => {
      const app = await NestFactory.createApplicationContext(moduleCls);
      app.useLogger(new FirebaseLoggerAdapter());
      return app;
    },
  );

  public resolveLazyService: <T>(
    container: INestApplicationContext,
    module: LazyImport,
    service: LazyImport<T>,
  ) => Promise<T> = memoize(async (container, module, service) => {
    const moduleType = await resolveLazyType(module);

    const lazyModuleLoader = container.get(LazyModuleLoader);
    const moduleRef = await lazyModuleLoader.load(() => moduleType);
    const serviceType = await resolveLazyType(service);

    return moduleRef.get(serviceType);
  });
}

const defaultNestFirebaseResolverInstance = new DefaultNestFirebaseResolver();

export default defaultNestFirebaseResolverInstance;
