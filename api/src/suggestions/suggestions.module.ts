import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Suggestion } from './suggestion.entity.js';
import { SuggestionsAdminController, SuggestionsController } from './suggestions.controller.js';
import { SuggestionsService } from './suggestions.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([Suggestion])],
  controllers: [SuggestionsController, SuggestionsAdminController],
  providers: [SuggestionsService],
})
export class SuggestionsModule {}
