import { HttpException, HttpStatus } from '@nestjs/common';
import { HttpsError } from 'firebase-functions/v2/https';

// eslint-disable-next-line max-lines-per-function
export const exceptionsToCallResponse = (e: unknown): HttpsError => {
  if (e instanceof HttpsError) {
    return e;
  }

  if (e instanceof HttpException) {
    switch (e.getStatus()) {
      case HttpStatus.BAD_REQUEST:
        return new HttpsError('invalid-argument', e.message, e.getResponse());
      case HttpStatus.UNAUTHORIZED:
        return new HttpsError('unauthenticated', e.message, e.getResponse());

      case HttpStatus.FORBIDDEN:
        return new HttpsError('permission-denied', e.message, e.getResponse());

      case HttpStatus.NOT_FOUND:
        return new HttpsError('not-found', e.message, e.getResponse());

      case HttpStatus.CONFLICT:
        return new HttpsError('aborted', e.message, e.getResponse());

      case HttpStatus.PRECONDITION_FAILED:
        return new HttpsError('failed-precondition', e.message, e.getResponse());

      case HttpStatus.TOO_MANY_REQUESTS:
        return new HttpsError('resource-exhausted', e.message, e.getResponse());

      case HttpStatus.INTERNAL_SERVER_ERROR:
        return new HttpsError('internal', e.message, e.getResponse());

      case HttpStatus.SERVICE_UNAVAILABLE:
        return new HttpsError('unavailable', e.message, e.getResponse());

      case HttpStatus.GATEWAY_TIMEOUT:
        return new HttpsError('deadline-exceeded', e.message, e.getResponse());

      case HttpStatus.NOT_IMPLEMENTED:
        return new HttpsError('unimplemented', e.message, e.getResponse());

      default:
        return new HttpsError('unknown', e.message, e.getResponse());
    }
  }
  return new HttpsError('unknown', e['message'] ?? '');
};
