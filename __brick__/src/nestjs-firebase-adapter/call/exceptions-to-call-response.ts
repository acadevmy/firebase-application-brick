import { HttpException, HttpStatus } from '@nestjs/common';
import { FunctionsErrorCode } from 'firebase-functions/lib/common/providers/https';
import { HttpsError } from 'firebase-functions/v2/https';

export const exceptionsToCallResponse = (exception: unknown): HttpsError => {
  if (exception instanceof HttpsError) {
    return exception;
  }

  if (exception instanceof HttpException) {
    return httpExceptionToFirebaseHttpError(exception);
  }

  return new HttpsError('unknown', exception['message'] ?? '');
};

const httpExceptionToFirebaseHttpError = (exception: HttpException) => {
  const status = exception.getStatus();
  const functionErrorCode = httpStatusToFunctionsErrorCode(status);

  return new HttpsError(functionErrorCode, exception.message, exception.getResponse());
};

const httpStatusToFunctionsErrorCode = (status: number): FunctionsErrorCode => {
  switch (status) {
    case HttpStatus.BAD_REQUEST:
      return 'invalid-argument';
    case HttpStatus.UNAUTHORIZED:
      return 'unauthenticated';

    case HttpStatus.FORBIDDEN:
      return 'permission-denied';

    case HttpStatus.NOT_FOUND:
      return 'not-found';

    case HttpStatus.CONFLICT:
      return 'aborted';

    case HttpStatus.PRECONDITION_FAILED:
      return 'failed-precondition';

    case HttpStatus.TOO_MANY_REQUESTS:
      return 'resource-exhausted';

    case HttpStatus.INTERNAL_SERVER_ERROR:
      return 'internal';

    case HttpStatus.SERVICE_UNAVAILABLE:
      return 'unavailable';

    case HttpStatus.GATEWAY_TIMEOUT:
      return 'deadline-exceeded';

    case HttpStatus.NOT_IMPLEMENTED:
      return 'unimplemented';

    default:
      return 'unknown';
  }
};
