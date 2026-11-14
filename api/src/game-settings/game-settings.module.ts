import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { GameCategories } from './game-categories.entity.js';
import { GameSetting } from './game-setting.entity.js';
import { GameThumbnail } from './game-thumbnail.entity.js';
import { GameThumbnailsService } from './game-thumbnails.service.js';
import { GameSettingsAdminController, GameSettingsController } from './game-settings.controller.js';
import { GameSettingsService } from './game-settings.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([GameSetting, GameCategories, GameThumbnail])],
  controllers: [GameSettingsController, GameSettingsAdminController],
  providers: [GameSettingsService, GameThumbnailsService],
})
export class GameSettingsModule {}
