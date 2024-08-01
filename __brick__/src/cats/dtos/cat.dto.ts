import { Exclude, Expose } from 'class-transformer';

@Exclude()
export class CatDTO {
  @Expose()
  public readonly id: string;
  @Expose()
  public readonly name: string;

  public constructor(opts: Readonly<CatDTO>) {
    this.id = opts.id;
    this.name = opts.name;
  }
}
