import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import firebaseFunctionsTest from 'firebase-functions-test';
import { FeaturesList } from 'firebase-functions-test/lib/features';
import { beforeAll, describe, expect, Mocked, test, vi } from 'vitest';

import { wrapNestOnCallForTest, WrappedNestOnCall } from '../../nestjs-firebase-adapter';
import { CatDTO } from '../dtos';
import { CatsService } from '../services';
import { findAllCats } from './find-all-cats.function';

describe('findAllCats', () => {
  let app: INestApplication;
  let firebase: FeaturesList;
  let findAllCatsWrapped: WrappedNestOnCall;
  let catService: Mocked<CatsService>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [{ provide: CatsService, useValue: { findAll: vi.fn() } }],
    }).compile();

    firebase = firebaseFunctionsTest();
    app = moduleRef.createNestApplication();
    catService = app.get(CatsService);
    findAllCatsWrapped = wrapNestOnCallForTest(firebase, app, findAllCats);
  });

  test('should find all cats', async () => {
    catService.findAll.mockResolvedValue([new CatDTO({ id: '123', name: 'Pallino' })]);
    const actual = await findAllCatsWrapped({});
    expect(actual).toEqual([{ id: '123', name: 'Pallino' }]);
  });
});
