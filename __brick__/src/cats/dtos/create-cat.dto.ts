import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CreateCatDTO {
  @Expose()
  @ApiProperty({
    description: 'the name of the cat',
    example: 'Pallino',
  })
  public readonly name: string;

  public constructor(opts: Readonly<CreateCatDTO>) {
    this.name = opts.name;
  }
}
