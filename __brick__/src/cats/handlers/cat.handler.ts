import { Injectable } from '@nestjs/common';

import { OnCallHandler } from '../../firebase-functions-adapters';
import { CatDTO } from '../dtos';
import { CatService } from '../services';

@Injectable()
class CatHandler implements OnCallHandler<void> {
  constructor(private readonly catService: CatService) {}

  handle(): Promise<Array<CatDTO>> {
    return this.catService.findAll();
  }
}

export default CatHandler;
