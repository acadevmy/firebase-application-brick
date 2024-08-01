/* eslint-disable  @typescript-eslint/no-explicit-any */

import { INestApplicationContext } from '@nestjs/common';
import { instanceToPlain, plainToInstance } from 'class-transformer';
import { ClassConstructor } from 'class-transformer/types/interfaces';
import { isNotEmpty, validate } from 'class-validator';
import { Runnable } from 'firebase-functions';
import { HttpsError } from 'firebase-functions/v1/https';
import {
  CallableFunction,
  CallableRequest,
  HttpsFunction,
  onCall,
} from 'firebase-functions/v2/https';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { WrappedFunction } from 'firebase-functions-test/lib/v1';
import { isNil } from 'lodash-es';

import defaultNestFirebaseResolverInstance from './default-nest-firebase-resolver';
import { exceptionsToCallResponse } from './exceptions-to-call-response';
import { NestFirebaseResolver } from './nest-firebase-resolver';
import { TestNestFirebaseResolver } from './test-nest-firebase-resolver';
import { LoaderFn } from './types';

export type WrappedNestOnCall = WrappedFunction<any, HttpsFunction & Runnable<any>>;

export interface NestOnCall extends CallableFunction<any, Promise<any>> {
  nestFirebaseResolver: NestFirebaseResolver;
}

export const createNestOnCall = (
  moduleCls: any,
  module: LoaderFn,
  handler: LoaderFn,
  dtoType?: ClassConstructor<any>,
): NestOnCall => {
  let nestOnCall = {
    nestFirebaseResolver: defaultNestFirebaseResolverInstance,
  };

  const callable = onCall(async (request) => {
    const handlerInstance = await nestOnCall.nestFirebaseResolver.resolveHandler(
      moduleCls,
      module,
      handler,
    );

    request = await parseRequestData(dtoType, request);

    try {
      const result = await Promise.resolve(handlerInstance.handle(request));

      return instanceToPlain(result);
    } catch (e) {
      throw exceptionsToCallResponse(e);
    }
  });

  nestOnCall = Object.assign(callable, nestOnCall);
  return nestOnCall as unknown as NestOnCall;
};

export const wrapNestOnCallForTest = (
  firebaseMock: FeaturesList,
  app: INestApplicationContext,
  nestOnCall: NestOnCall,
): WrappedNestOnCall => {
  nestOnCall.nestFirebaseResolver = new TestNestFirebaseResolver(app);

  return firebaseMock.wrap(nestOnCall);
};

const parseRequestData = async (
  dtoType: ClassConstructor<any>,
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
