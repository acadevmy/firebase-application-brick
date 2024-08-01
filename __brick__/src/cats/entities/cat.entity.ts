import { Collection } from 'fireorm';

@Collection('cats')
export class Cat {
  public id: string = '';
  public name: string = '';
}
