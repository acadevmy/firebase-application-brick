import { NestCallableRequest } from './nest-callable-request';

export type NestOnCallHandler<T> = (opts: NestCallableRequest<T>) => Promise<any> | any;
