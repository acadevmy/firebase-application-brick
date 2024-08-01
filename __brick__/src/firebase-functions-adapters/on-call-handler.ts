import { CallableRequest } from 'firebase-functions/v2/https';

export interface OnCallHandler<T> {
  handle(request: CallableRequest<T>): unknown;
}
