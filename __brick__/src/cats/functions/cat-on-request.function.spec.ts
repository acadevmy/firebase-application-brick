import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import TestAgent from 'supertest/lib/agent';
import { beforeAll, describe, Mocked, test, vi } from 'vitest';

import { wrapNestOnRequestForTest } from '../../firebase-functions-adapters';
import { CatDTO } from '../dtos';
import CatHandler from '../handlers/cat.handler';
import CatRequestHandler from '../handlers/cat-request.handler';
import { CatService } from '../services';
import { catOnRequest } from './cat.function';

describe('Cats OnRequest', () => {
  let app: INestApplication;
  let catOnRequestFunction: TestAgent;
  let catService: Mocked<CatService>;

  beforeAll(async () => {
    const moduleRef = await Test.createTestingModule({
      providers: [
        CatHandler,
        CatRequestHandler,
        { provide: CatService, useValue: { findAll: vi.fn() } },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    catService = app.get(CatService);
    catOnRequestFunction = wrapNestOnRequestForTest(app, catOnRequest);
  });

  test('should call cat function', async () => {
    catService.findAll.mockResolvedValue([new CatDTO({ id: '123', name: 'Pallino' })]);

    await catOnRequestFunction
      .get('/')
      .expect(200)
      .expect([{ id: '123', name: 'Pallino' }]);
  });
});
