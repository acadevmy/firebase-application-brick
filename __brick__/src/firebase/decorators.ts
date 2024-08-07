import { Inject } from '@nestjs/common';

import {
  FIREBASE_APP,
  FIREBASE_AUTH,
  FIREBASE_FIRESTORE,
  FIREBASE_MESSAGING,
  FIREBASE_STORAGE,
} from './constants';

/**
 * Custom injector for Firebase App instance.
 * It injects the Firebase App instance into the class property where it's used.
 *
 * @example
 * ```
 * @InjectFirebaseApp() private readonly firebaseApp: FirebaseApp;
 * ```
 */
export const InjectFirebaseApp = () => {
  return Inject(FIREBASE_APP);
};

/**
 * Custom injector for Firestore instance.
 * It injects the Firestore instance into the class property where it's used.
 *
 * @example
 * ```
 * @InjectFirestore() private readonly firestore: Firestore;
 * ```
 */
export const InjectFirestore = () => {
  return Inject(FIREBASE_FIRESTORE);
};

/**
 * Custom injector for Firebase Auth instance.
 * It injects the Firebase Auth instance into the class property where it's used.
 *
 * @example
 * ```
 * @InjectFirebaseAuth() private readonly firebaseAuth: FirebaseAuth;
 * ```
 */
export const InjectFirebaseAuth = () => {
  return Inject(FIREBASE_AUTH);
};

/**
 * Custom injector for Firebase Storage instance.
 * It injects the Firebase Storage instance into the class property where it's used.
 *
 * @example
 * ```
 * @InjectFirebaseStorage() private readonly firebaseStorage: FirebaseStorage;
 * ```
 */
export const InjectFirebaseStorage = () => {
  return Inject(FIREBASE_STORAGE);
};

/**
 * Custom injector for Firebase Messaging instance.
 * It injects the Firebase Messaging instance into the class property where it's used.
 *
 * @example
 * ```
 * @InjectFirebaseMessaging() private readonly firebaseMessaging: FirebaseMessaging;
 * ```
 */
export const InjectFirebaseMessaging = () => {
  return Inject(FIREBASE_MESSAGING);
};
