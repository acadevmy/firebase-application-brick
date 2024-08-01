import { Injectable } from '@nestjs/common';
import { BaseFirestoreRepository } from 'fireorm';
import { InjectRepository } from 'nestjs-fireorm';

import { Cat } from '../entities';
import { CatMapper } from './cat.mapper';

@Injectable()
export class CatService {
  public constructor(
    @InjectRepository(Cat) private readonly repository: BaseFirestoreRepository<Cat>,
    private readonly mapper: CatMapper,
  ) {}

  public async findAll(): Promise<Cat[]> {
    const cats = await this.repository.find();
    return this.mapper.toDtos(cats);
  }
}
