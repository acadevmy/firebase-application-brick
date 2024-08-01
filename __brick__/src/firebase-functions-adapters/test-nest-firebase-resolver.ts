import { INestApplicationContext } from '@nestjs/common';

import { NestFirebaseResolver } from './nest-firebase-resolver';
import { isDefaultExport, LoaderFn } from './types';

export class TestNestFirebaseResolver implements NestFirebaseResolver {
  constructor(private readonly app: INestApplicationContext) {}

  public async resolveHandler(moduleCls: any, module: LoaderFn, handler: LoaderFn) {
    let handlerType = await handler();
    if (isDefaultExport(handlerType)) {
      handlerType = handlerType.default;
    }

    return this.app.get(handlerType);
  }
}
