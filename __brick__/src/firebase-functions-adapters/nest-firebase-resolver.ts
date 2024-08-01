import { LoaderFn } from './types';

export interface NestFirebaseResolver {
  resolveHandler(moduleCls: any, module: LoaderFn, handler: LoaderFn): Promise<any>;
}
