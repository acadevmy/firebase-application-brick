import { ApiProperty } from '@nestjs/swagger';
import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class UpdateCatDTO {
  @Expose()
  @ApiProperty({
    description: 'the name of the cat',
    example: 'Pallino',
  })
  public readonly name: string;

  public constructor(opts: Readonly<UpdateCatDTO>) {
    this.name = opts.name;
  }
}
