import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameCategories } from './game-categories.entity.js';
import { GameSetting } from './game-setting.entity.js';
import { GameSettingsAdminController, GameSettingsController } from './game-settings.controller.js';
import { GameSettingsService } from './game-settings.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([GameSetting, GameCategories])],
  controllers: [GameSettingsController, GameSettingsAdminController],
  providers: [GameSettingsService],
})
export class GameSettingsModule {}
