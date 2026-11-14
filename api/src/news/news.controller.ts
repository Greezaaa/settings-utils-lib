import { Body, Controller, Delete, Get, Header, HttpCode, Param, Post, Put, UseGuards } from '@nestjs/common';
import { SuperAdminGuard } from '../security/admin.guard.js';
import type { NewsInput } from './news.schema.js';
import { newsIdSchema, newsSchema } from './news.schema.js';
import { NewsService } from './news.service.js';
import type { NewsView } from './news.service.js';

@Controller('v1/news')
export class NewsController {
  constructor(private readonly news: NewsService) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  async list(): Promise<{ news: NewsView[] }> {
    return { news: await this.news.list() };
  }
}

@Controller('admin/news')
@UseGuards(SuperAdminGuard)
export class NewsAdminController {
  constructor(private readonly news: NewsService) {}

  @Post()
  add(@Body({ schema: newsSchema }) input: NewsInput): Promise<NewsView> {
    return this.news.add(input);
  }

  @Put(':id')
  change(@Param('id', { schema: newsIdSchema }) id: number, @Body({ schema: newsSchema }) input: NewsInput): Promise<NewsView> {
    return this.news.change(id, input);
  }

  @Delete(':id')
  @HttpCode(204)
  remove(@Param('id', { schema: newsIdSchema }) id: number): Promise<void> {
    return this.news.remove(id);
  }
}
