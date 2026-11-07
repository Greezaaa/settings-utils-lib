import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameSetting } from './game-setting.entity.js';
import {
  GameSettingsAdminController,
  GameSettingsController,
} from './game-settings.controller.js';
import { GameSettingsService } from './game-settings.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([GameSetting])],
  controllers: [GameSettingsController, GameSettingsAdminController],
  providers: [GameSettingsService],
})
export class GameSettingsModule {}
