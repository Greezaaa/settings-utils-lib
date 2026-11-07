import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PlayCount } from './play-count.entity.js';
import { PlaysController } from './plays.controller.js';
import { PlaysService } from './plays.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([PlayCount])],
  controllers: [PlaysController],
  providers: [PlaysService],
})
export class PlaysModule {}
