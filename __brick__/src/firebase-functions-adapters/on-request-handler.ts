/* eslint-disable  @typescript-eslint/no-explicit-any */

import { Request, Response } from 'express';

export interface OnRequestHandler {
  handle(request: Request, response: Response): Promise<any>;
}
