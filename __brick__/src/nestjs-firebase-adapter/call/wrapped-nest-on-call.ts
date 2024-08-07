import { Runnable } from 'firebase-functions';
import { HttpsFunction } from 'firebase-functions/lib/v2/providers/https';
import { WrappedFunction } from 'firebase-functions-test/lib/v1';

export type WrappedNestOnCall = WrappedFunction<any, HttpsFunction & Runnable<any>>;
