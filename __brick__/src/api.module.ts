import { Module } from '@nestjs/common';

import CatsModule from './cats/cats.module';
import { FirebaseModule } from './firebase';

@Module({
  imports: [FirebaseModule.forRoot(), CatsModule],
})
export default class ApiModule {}
