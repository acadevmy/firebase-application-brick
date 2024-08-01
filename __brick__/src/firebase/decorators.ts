import { Inject } from '@nestjs/common';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_MESSAGING,
  FIREBASE_STORAGE,
} from './constants';

export const InjectFirebaseApp = () => {
  return Inject(FIREBASE_APP);
};

export const InjectFirestore = () => {
  return Inject(FIREBASE_FIRESTORE);
};

export const InjectFirebaseAuth = () => {
  return Inject(FIREBASE_AUTH);
};

export const InjectFirebaseStorage = () => {
  return Inject(FIREBASE_STORAGE);
};

export const InjectFirebaseMessaging = () => {
  return Inject(FIREBASE_MESSAGING);
};
