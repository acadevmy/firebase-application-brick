/* eslint-disable  @typescript-eslint/no-explicit-any */
/* eslint-disable max-lines */

import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { isNotEmpty, validate } from 'class-validator';
import { HttpsError } from 'firebase-functions/v1/https';
import { CallableRequest, onCall } from 'firebase-functions/v2/https';
import { isNil } from 'lodash-es';

import defaultNestFirebaseResolverInstance from '../default-nest-firebase-resolver';
import { InjectLazyService } from '../types';
import { exceptionsToCallResponse } from './exceptions-to-call-response';
import { NestCallableRequest } from './nest-callable-request';
import { NestOnCall } from './nest-on-call';
import { NestOnCallHandler } from './nest-on-call-handler';

/**
 * Creates a NestOnCall function, which is a wrapper around the onCall function
 * from the Firebase `firebase-functions/v2/https` package. This wrapper initializes
 * the dependency injection container before invoking the actual function, allowing
 * developers to utilize services created in NestJS.
 *
 * @template T - The type of the data transfer object (DTO) for the request data.
 *
 * @param moduleCls - The main NestJS module class to be used for dependency injection.
 * @param dtoType - The DTO class constructor for validating request data
 * or the handler function if no DTO is required.
 * @param handler - The function to handle the request, if a DTO is provided as the
 * second parameter.
 *
 * @returns A NestOnCall function that can be deployed as a Firebase Callable function.
 *
 * This function exposes the dependency injection container and a utility `injectLazyService`
 * through the `NestCallableRequest` parameter, which allows for lazy loading of services
 * from modules that are not loaded during the initial bootstrap phase. This strategy is used
 * to optimize cold start times in serverless environments.
 *
 * @example
 * ```
 *
 * import { createNestOnCall } from '../../nestjs-firebase-adapter';
 * import { TriggersModule } from '../../triggers.module';
 *
 * export const findAllCats = createNestOnCall<CatsQueryParamsDTO>(TriggersModule, async ({ data, injectLazyService }) => {
 *   // here we bootstrap and inject a service of a lazy module
 *   const service = await injectLazyService(
 *     () => import('../cats.module'),
 *     () => import('../services/cats.service'),
 *   );
 *
 *   // data is a CatsQueryParamsDTO type
 *   return service.findAll(data);
 * });
 * ```
 */
export function createNestOnCall<T>(
  moduleCls: any,
  dtoType: ClassConstructor<T>,
  handler: NestOnCallHandler<T>,
): NestOnCall;

/**
 * Creates a NestOnCall function without request params, which is a wrapper around the onCall function
 * from the Firebase `firebase-functions/v2/https` package. This wrapper initializes
 * the dependency injection container before invoking the actual function, allowing
 * developers to utilize services created in NestJS.
 *
 * @param moduleCls - The main NestJS module class to be used for dependency injection.
 * or the handler function if no DTO is required.
 * @param handler - The function to handle the request
 *
 * @returns A NestOnCall function that can be deployed as a Firebase Callable function.
 *
 * This function exposes the dependency injection container and a utility `injectLazyService`
 * through the `NestCallableRequest` parameter, which allows for lazy loading of services
 * from modules that are not loaded during the initial bootstrap phase. This strategy is used
 * to optimize cold start times in serverless environments.
 *
 * @example
 * ```
 *
 * import { createNestOnCall } from '../../nestjs-firebase-adapter';
 * import { TriggersModule } from '../../triggers.module';
 *
 * export const findAllCats = createNestOnCall(TriggersModule, async ({ injectLazyService }) => {
 *   // here we bootstrap and inject a service of a lazy module
 *   const service = await injectLazyService(
 *     () => import('../cats.module'),
 *     () => import('../services/cats.service'),
 *   );
 *
 *   return service.findAll();
 * });
 * ```
 */
export function createNestOnCall(moduleCls: any, handler: NestOnCallHandler<unknown>): NestOnCall;
export function createNestOnCall<T>(
  moduleCls: any,
  dtoTypeOrHandler: ClassConstructor<T> | NestOnCallHandler<T>,
  handler?: NestOnCallHandler<T>,
): NestOnCall {
  if (arguments.length === 2) {
    handler = dtoTypeOrHandler as unknown as (opts: NestCallableRequest<T>) => Promise<any>;
    dtoTypeOrHandler = undefined;
  }

  let nestOnCall: Pick<NestOnCall, 'nestFirebaseResolver'> = {
    nestFirebaseResolver: defaultNestFirebaseResolverInstance,
  };

  const callable = onCall({}, async (request) => {
    const container = await nestOnCall.nestFirebaseResolver.resolveApplicationContext(moduleCls);
    const injectLazyService: InjectLazyService = (module, service) =>
      nestOnCall.nestFirebaseResolver.resolveLazyService(container, module, service);

    try {
      request = await parseRequestData(dtoTypeOrHandler as ClassConstructor<T>, request);

      const result = await handler({ ...request, container, injectLazyService });

      return instanceToPlain(result);
    } catch (e) {
      throw exceptionsToCallResponse(e);
    }
  });

  nestOnCall = Object.assign(callable, nestOnCall);

  return nestOnCall as unknown as NestOnCall;
}

const parseRequestData = async (
  dtoType: ClassConstructor<any> | undefined,
  request: CallableRequest,
): Promise<CallableRequest> => {
  if (isNil(dtoType)) {
    return request;
  }

  if (request.data instanceof dtoType) {
    return request;
  }

  const data = plainToInstance(dtoType, request.data);

  if (isNil(data)) {
    throw new HttpsError('invalid-argument', 'Invalid request, data is null');
  }

  const errors = await validate(data);

  if (isNotEmpty(errors)) {
    throw new HttpsError('invalid-argument', 'Invalid request', errors);
  }

  return { ...request, data };
};
