/* eslint-disable  @typescript-eslint/no-explicit-any */
import { INestApplicationContext } from '@nestjs/common';
import { instanceToPlain } from 'class-transformer';
import express from 'express';
import { Runnable } from 'firebase-functions';
import { HttpsFunction, onRequest } from 'firebase-functions/v2/https';
import { isNil } from 'lodash-es';
import request from 'supertest';
import TestAgent from 'supertest/lib/agent';

import defaultNestFirebaseResolverInstance from './default-nest-firebase-resolver';
import { exceptionsToHttpResponse } from './exceptions-to-http-response';
import { NestFirebaseResolver } from './nest-firebase-resolver';
import { OnRequestHandler } from './on-request-handler';
import { TestNestFirebaseResolver } from './test-nest-firebase-resolver';
import { LoaderFn } from './types';

export interface NestOnRequest extends HttpsFunction, Runnable<any> {
  nestFirebaseResolver: NestFirebaseResolver;
}

export const createNestOnRequest = (
  moduleCls: any,
  module: LoaderFn,
  handler: LoaderFn,
): NestOnRequest => {
  let nestOnRequest = {
    nestFirebaseResolver: defaultNestFirebaseResolverInstance,
  };

  const callable = onRequest(async (request, response) => {
    const handlerInstance: OnRequestHandler =
      await nestOnRequest.nestFirebaseResolver.resolveHandler(moduleCls, module, handler);

    try {
      const result = await handlerInstance.handle(request, response);
      if (!isNil(result) && !response.writableEnded) {
        response.send(instanceToPlain(result));
      }
    } catch (e) {
      exceptionsToHttpResponse(response, e);
    }
  });

  nestOnRequest = Object.assign(callable, nestOnRequest);
  return nestOnRequest as unknown as NestOnRequest;
};

export const wrapNestOnRequestForTest = (
  app: INestApplicationContext,
  nestOnRequest: NestOnRequest,
): TestAgent => {
  nestOnRequest.nestFirebaseResolver = new TestNestFirebaseResolver(app);

  const expressInstance = express();

  expressInstance.use(nestOnRequest as any);
  return request(expressInstance);
};
