import { Module } from '@nestjs/common';
import { FireormModule } from 'nestjs-fireorm';

import { CatsController } from './controllers/cats.controller';
import { Cat } from './entities';
import { CatsMapper, CatsService } from './services';

@Module({
  controllers: [CatsController],
  imports: [FireormModule.forFeature([Cat])],
  providers: [CatsService, CatsMapper],
  exports: [CatsService],
})
export default class CatsModule {}
