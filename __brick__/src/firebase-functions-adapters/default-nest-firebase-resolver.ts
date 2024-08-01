import { INestApplicationContext, Type } from '@nestjs/common';
import { LazyModuleLoader, NestFactory } from '@nestjs/core';
import { memoize } from 'lodash-es';

import { FirebaseLoggerAdapter } from '../firebase-logger.adapter';
import { NestFirebaseResolver } from './nest-firebase-resolver';
import { OnCallHandler } from './on-call-handler';
import { isDefaultExport, LoaderFn } from './types';

export class DefaultNestFirebaseResolver implements NestFirebaseResolver {
  public async resolveHandler(moduleCls: any, module: LoaderFn, handler: LoaderFn) {
    const appContext = await this.defaultCreateNestApplicationFactory(moduleCls);

    return await this.doResolveHandler(appContext, module, handler);
  }

  private defaultCreateNestApplicationFactory = memoize(async (moduleCls) => {
    const app = await NestFactory.createApplicationContext(moduleCls);
    app.useLogger(new FirebaseLoggerAdapter());
    return app;
  });

  private doResolveHandler: (
    appContext: INestApplicationContext,
    module: LoaderFn,
    handler: LoaderFn,
  ) => Promise<any> = memoize(async (appContext, module, handler): Promise<any> => {
    let moduleType = await module();
    if (isDefaultExport(moduleType)) {
      moduleType = moduleType.default;
    }

    const lazyModuleLoader = appContext.get(LazyModuleLoader);
    const moduleRef = await lazyModuleLoader.load(() => moduleType as Type<unknown>);
    let handlerType = await handler();
    if (isDefaultExport(handlerType)) {
      handlerType = handlerType.default;
    }

    return moduleRef.get(handlerType as Type<unknown>) as OnCallHandler<unknown>;
  });
}

const defaultNestFirebaseResolverInstance = new DefaultNestFirebaseResolver();

export default defaultNestFirebaseResolverInstance;
