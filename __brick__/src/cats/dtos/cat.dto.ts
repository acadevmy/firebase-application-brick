import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CatDTO {
  @Expose()
  @ApiProperty({
    description: 'the id of the cat',
    example: 'eisghergrdij239r24',
  })
  public readonly id: string;

  @Expose()
  @ApiProperty({
    description: 'the name of the cat',
    example: 'Pallino',
  })
  public readonly name: string;

  public constructor(opts: Readonly<CatDTO>) {
    this.id = opts.id;
    this.name = opts.name;
  }
}
