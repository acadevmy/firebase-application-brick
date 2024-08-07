import { Injectable, NotFoundException } from '@nestjs/common';
import { BaseFirestoreRepository } from 'fireorm';
import { isNil } from 'lodash-es';
import { InjectRepository } from 'nestjs-fireorm';

import { CatDTO, CreateCatDTO, UpdateCatDTO } from '../dtos';
import { Cat } from '../entities';
import { CatsMapper } from './cats.mapper';

@Injectable()
export class CatsService {
  public constructor(
    @InjectRepository(Cat) private readonly repository: BaseFirestoreRepository<Cat>,
    private readonly mapper: CatsMapper,
  ) {}

  public async findAll(): Promise<Cat[]> {
    const cats = await this.repository.find();
    return this.mapper.toDtos(cats);
  }

  public async remove(id: string): Promise<CatDTO> {
    const cat = await this.repository.findById(id);
    if (isNil(cat)) {
      throw new NotFoundException(id);
    }
    await this.repository.delete(id);

    return this.mapper.toDto(cat);
  }

  public async update(id: string, updates: UpdateCatDTO): Promise<CatDTO> {
    const cat = await this.repository.findById(id);
    if (isNil(cat)) {
      throw new NotFoundException(id);
    }

    cat.name = updates.name;
    await this.repository.update(cat);

    return this.mapper.toDto(cat);
  }

  public async add(create: CreateCatDTO): Promise<CatDTO> {
    let cat = new Cat();
    cat.name = create.name;

    cat = await this.repository.create(cat);
    return this.mapper.toDto(cat);
  }

  public async findOne(id: string): Promise<CatDTO> {
    const cat = await this.repository.findById(id);

    if (isNil(cat)) {
      throw new NotFoundException(id);
    }

    return this.mapper.toDto(cat);
  }
}

export default CatsService;
