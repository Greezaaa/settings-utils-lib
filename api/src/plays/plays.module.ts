import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayCount } from './play-count.entity.js';
import { PlaysAdminController, PlaysController } from './plays.controller.js';
import { PlaysService } from './plays.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PlayCount])],
  controllers: [PlaysController, PlaysAdminController],
  providers: [PlaysService],
  exports: [PlaysService],
})
export class PlaysModule {}
