import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import { ExpressAdapter } from '@nestjs/platform-express';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import cookieParser from 'cookie-parser';
import express from 'express';
import { HttpsFunction, HttpsOptions, onRequest } from 'firebase-functions/v2/https';
import helmet from 'helmet';
import { memoize } from 'lodash-es';

import { FirebaseLoggerAdapter } from '../firebase-logger.adapter';
import { LazyImport } from '../types';
import { resolveLazyType } from '../utilities';

export function createRestApi(moduleCls: LazyImport): HttpsFunction;
export function createRestApi(opts: HttpsOptions, moduleCls: LazyImport): HttpsFunction;
export function createRestApi(
  optsOrModuleCls: HttpsOptions | LazyImport,
  moduleCls?: LazyImport,
): HttpsFunction {
  if (arguments.length === 1) {
    moduleCls = optsOrModuleCls as LazyImport;
    optsOrModuleCls = {};
  }

  return onRequest(optsOrModuleCls as HttpsOptions, async (request, response) => {
    const moduleType = resolveLazyType(moduleCls);
    const handler = await createExpressHandler(moduleType);
    return handler(request, response);
  });
}

const createExpressHandler: (moduleCls: any) => Promise<express.Express> = memoize(
  async (moduleCls) => {
    const server = express();
    const application = await NestFactory.create(moduleCls, new ExpressAdapter(server));
    application.useLogger(new FirebaseLoggerAdapter());
    application.enableCors();
    application.useGlobalPipes(new ValidationPipe());
    application.use(cookieParser());
    application.use(helmet());

    const config = new DocumentBuilder().build();

    const document = SwaggerModule.createDocument(application, config);
    SwaggerModule.setup('/openapi', application, document);
    await application.init();

    return server;
  },
);
