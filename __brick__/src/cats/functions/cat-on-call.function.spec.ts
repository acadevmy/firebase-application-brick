import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import firebaseFunctionsTest from 'firebase-functions-test';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { beforeAll, describe, expect, Mocked, test, vi } from 'vitest';

import { wrapNestOnCallForTest, WrappedNestOnCall } from '../../firebase-functions-adapters';
import { CatDTO } from '../dtos';
import CatHandler from '../handlers/cat.handler';
import CatRequestHandler from '../handlers/cat-request.handler';
import { CatService } from '../services';
import { catOnCall } from './cat.function';

describe('Cats OnCall', () => {
  let app: INestApplication;
  let firebase: FeaturesList;
  let catOnCallFunction: WrappedNestOnCall;
  let catService: Mocked<CatService>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CatHandler,
        CatRequestHandler,
        { provide: CatService, useValue: { findAll: vi.fn() } },
      ],
    }).compile();

    firebase = firebaseFunctionsTest();
    app = moduleRef.createNestApplication();
    catService = app.get(CatService);
    catOnCallFunction = wrapNestOnCallForTest(firebase, app, catOnCall);
  });

  test('should call cat function', async () => {
    catService.findAll.mockResolvedValue([new CatDTO({ id: '123', name: 'Pallino' })]);
    const actual = await catOnCallFunction({});
    expect(actual).toEqual([{ id: '123', name: 'Pallino' }]);
  });
});
