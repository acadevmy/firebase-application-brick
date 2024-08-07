import { DynamicModule, Module, Provider } from '@nestjs/common';
import admin from 'firebase-admin';
import { memoize } from 'lodash-es';
import { FireormModule } from 'nestjs-fireorm';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_MESSAGING,
  FIREBASE_STORAGE,
} from './constants';
import App = admin.app.App;
import Firestore = admin.firestore.Firestore;

@Module({})
export class FirebaseModule {
  private static readonly PROVIDERS: Array<Provider> = [
    {
      useFactory: memoize(() => admin.initializeApp()),
      provide: FIREBASE_APP,
    },
    {
      useFactory: (app: App) => app.firestore(),
      provide: FIREBASE_FIRESTORE,
      inject: [FIREBASE_APP],
    },
    {
      useFactory: (app: App) => app.auth(),
      provide: FIREBASE_AUTH,
      inject: [FIREBASE_APP],
    },
    {
      useFactory: (app: App) => app.storage(),
      provide: FIREBASE_STORAGE,
      inject: [FIREBASE_APP],
    },
    {
      useFactory: (app: App) => app.messaging(),
      provide: FIREBASE_MESSAGING,
      inject: [FIREBASE_APP],
    },
  ];

  public static forRoot(): DynamicModule {
    return {
      global: true,
      exports: FirebaseModule.PROVIDERS,
      module: FirebaseModule,
      providers: FirebaseModule.PROVIDERS,
      imports: [
        FireormModule.forRootAsync({
          inject: [FIREBASE_FIRESTORE],
          useFactory: (firestore: Firestore) => ({
            firestore,
            fireormSettings: {
              validateModels: true,
              validatorOptions: { forbidUnknownValues: true },
            },
          }),
        }),
      ],
    };
  }
}
