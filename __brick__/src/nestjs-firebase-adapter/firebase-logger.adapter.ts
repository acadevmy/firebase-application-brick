/* eslint-disable  @typescript-eslint/no-explicit-any */
import { LoggerService } from '@nestjs/common';
import { logger } from 'firebase-functions';

export class FirebaseLoggerAdapter implements LoggerService {
  public log(message: any, ...optionalParams: any[]): void {
    logger.log(message, ...optionalParams);
  }

  public error(message: any, ...optionalParams: any[]): void {
    logger.error(message, ...optionalParams);
  }

  public warn(message: any, ...optionalParams: any[]): void {
    logger.warn(message, ...optionalParams);
  }

  public debug(message: any, ...optionalParams: any[]): void {
    logger.debug(message, ...optionalParams);
  }

  public verbose(message: any, ...optionalParams: any[]): void {
    logger.info(message, ...optionalParams);
  }

  public fatal(message: any, ...optionalParams: any[]): void {
    logger.error('[FATAL] ' + message, ...optionalParams);
  }

  public setLogLevels?(): void {
    return;
  }
}
