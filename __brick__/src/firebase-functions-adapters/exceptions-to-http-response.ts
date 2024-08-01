import { HttpException, InternalServerErrorException } from '@nestjs/common';
import { Response } from 'firebase-functions';

export const exceptionsToHttpResponse = (response: Response<any>, e: any) => {
  if (!(e instanceof HttpException)) {
    e = new InternalServerErrorException(e);
  }

  response.status(e.getStatus()).send(e.getResponse());
};
