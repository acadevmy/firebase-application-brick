import { Module } from '@nestjs/common';
import { FireormModule } from 'nestjs-fireorm';

import { Cat } from './entities';
import CatHandler from './handlers/cat.handler';
import CatRequestHandler from './handlers/cat-request.handler';
import { CatMapper, CatService } from './services';

@Module({
  imports: [FireormModule.forFeature([Cat])],
  providers: [CatService, CatMapper, CatHandler, CatRequestHandler],
})
export default class CatsModule {}
