import { Injectable } from '@nestjs/common';

import { OnRequestHandler } from '../../firebase-functions-adapters';
import { CatDTO } from '../dtos';
import { CatService } from '../services';

@Injectable()
class CatRequestHandler implements OnRequestHandler {
  constructor(private readonly catService: CatService) {}

  async handle(): Promise<Array<CatDTO>> {
    return this.catService.findAll();
  }
}

export default CatRequestHandler;
