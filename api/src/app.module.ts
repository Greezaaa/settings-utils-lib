import { Module } from '@nestjs/common';
import { ApiModule } from './api.module.js';
import { CoreModule } from './core.module.js';

@Module({
  imports: [CoreModule.forRoot({ runMigrations: true }), ApiModule],
})
export class AppModule {}
