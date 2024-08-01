import { Module } from '@nestjs/common';

import { FirebaseModule } from './firebase';

@Module({
  imports: [FirebaseModule.forRoot()],
})
export class AppModule {}
