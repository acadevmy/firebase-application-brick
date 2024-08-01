import { DynamicModule } from '@nestjs/common';
import firebaseFunctionsTest from 'firebase-functions-test';
import { BaseFirestoreRepository, IEntity } from 'fireorm';
import { FireormService } from 'nestjs-fireorm';
import { vi } from 'vitest';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_MESSAGING,
  FIREBASE_STORAGE,
} from './constants';
import { FirebaseModule } from './firebase.module';

export const mockFireOrmRepository = <T extends IEntity>(): BaseFirestoreRepository<T> =>
  ({
    config: vi.fn(),
    path: vi.fn(),
    colMetadata: vi.fn(),
    firestoreColRef: vi.fn(),
    update: vi.fn(),
    findOne: vi.fn(),
    extractTFromColSnap: vi.fn(),
    create: vi.fn(),
    customQuery: vi.fn(),
    delete: vi.fn(),
    execute: vi.fn(),
    find: vi.fn(),
    findById: vi.fn(),
    limit: vi.fn(),
    createBatch: vi.fn(),
    extractTFromDocSnap: vi.fn(),
    initializeSubCollections: vi.fn(),
    runTransaction: vi.fn(),
    orderByAscending: vi.fn(),
    toSerializableObject: vi.fn(),
    transformFirestoreTypes: vi.fn(),
    whereLessThan: vi.fn(),
    validate: vi.fn(),
    whereArrayContains: vi.fn(),
    whereIn: vi.fn(),
    whereArrayContainsAny: vi.fn(),
    whereEqualTo: vi.fn(),
    whereGreaterOrEqualThan: vi.fn(),
    whereGreaterThan: vi.fn(),
    whereNotIn: vi.fn(),
    whereLessOrEqualThan: vi.fn(),
    whereNotEqualTo: vi.fn(),
    orderByDescending: vi.fn(),
  }) as unknown as BaseFirestoreRepository<T>;

export const mockFirebaseModule = (): DynamicModule => {
  const firebase = firebaseFunctionsTest();

  const providers = [
    {
      provide: FireormService,
      useValue: {
        getRepository: mockFireOrmRepository,
        onModuleDestroy: vi.fn(),
      },
    },
    {
      useValue: firebase,
      provide: FIREBASE_APP,
    },
    {
      useValue: firebase.firestore,
      provide: FIREBASE_FIRESTORE,
    },
    {
      useValue: firebase.auth,
      provide: FIREBASE_AUTH,
    },
    {
      useValue: firebase.storage,
      provide: FIREBASE_STORAGE,
    },
    {
      useValue: firebase.pubsub,
      provide: FIREBASE_MESSAGING,
    },
  ];

  return {
    global: true,
    module: FirebaseModule,
    providers,
    exports: providers,
  };
};
