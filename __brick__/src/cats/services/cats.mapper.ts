import { Injectable } from '@nestjs/common';

import { CatDTO } from '../dtos';
import { Cat } from '../entities';

@Injectable()
export class CatsMapper {
  public toDto(cat: Cat): CatDTO {
    return new CatDTO(cat);
  }

  public toDtos(cats: Array<Cat>): Array<CatDTO> {
    return cats.map((cat) => this.toDto(cat));
  }
}
