import {
  Body,
  Controller,
  Delete,
  Get,
  Header,
  HttpCode,
  Param,
  Patch,
  Post,
  Query,
  StreamableFile,
  UploadedFile,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { Throttle } from '@nestjs/throttler';
import { z } from 'zod';
import { AdminGuard } from '../security/admin.guard.js';
import { IMAGE_MAX_BYTES } from './clean-image.js';
import { Suggestion } from './suggestion.entity.js';
import type {
  StatusInput,
  SuggestionInput,
  SuggestionStatus,
} from './suggestions.schema.js';
import {
  statusSchema,
  SUGGESTION_STATUSES,
  suggestionSchema,
} from './suggestions.schema.js';
import { SuggestionsService } from './suggestions.service.js';
import { TurnstileService } from './turnstile.service.js';

const idSchema = z.uuid();

/** The suggestions form: an idea in a category, with an optional picture; checked for bots, read only by moderators */
@Controller('v1/suggestions')
export class SuggestionsController {
  constructor(
    private readonly suggestions: SuggestionsService,
    private readonly turnstile: TurnstileService,
  ) {}

  @Post()
  @HttpCode(204)
  @Throttle({ default: { limit: 3, ttl: 3_600_000 } })
  @UseInterceptors(
    FileInterceptor('image', {
      // The picture, and the form's few short text fields (category, text, language, bot check)
      limits: {
        fileSize: IMAGE_MAX_BYTES,
        files: 1,
        fields: 6,
        fieldSize: 4096,
        parts: 8,
      },
    }),
  )
  async add(
    @Body({ schema: suggestionSchema }) input: SuggestionInput,
    @UploadedFile() image?: Express.Multer.File,
  ): Promise<void> {
    await this.turnstile.verify(input.turnstileToken);
    await this.suggestions.add(input, image?.buffer);
  }
}

/** For moderators: read suggestions and their pictures, mark them read or archived, or delete them */
@Controller('admin/suggestions')
@UseGuards(AdminGuard)
export class SuggestionsAdminController {
  constructor(private readonly suggestions: SuggestionsService) {}

  @Get()
  list(
    @Query('status', { schema: z.enum(SUGGESTION_STATUSES).default('new') })
    status: SuggestionStatus,
  ): Promise<Suggestion[]> {
    return this.suggestions.list(status);
  }

  @Get(':id/image')
  @Header('Content-Type', 'image/webp')
  async image(
    @Param('id', { schema: idSchema }) id: string,
  ): Promise<StreamableFile> {
    return new StreamableFile(await this.suggestions.image(id));
  }

  @Patch(':id')
  @HttpCode(204)
  async setStatus(
    @Param('id', { schema: idSchema }) id: string,
    @Body({ schema: statusSchema }) input: StatusInput,
  ): Promise<void> {
    await this.suggestions.setStatus(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  async remove(@Param('id', { schema: idSchema }) id: string): Promise<void> {
    await this.suggestions.remove(id);
  }
}
