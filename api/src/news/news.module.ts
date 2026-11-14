import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsItem } from './news-item.entity.js';
import { NewsAdminController, NewsController } from './news.controller.js';
import { NewsService } from './news.service.js';

@Module({
  imports: [TypeOrmModule.forFeature([NewsItem])],
  controllers: [NewsController, NewsAdminController],
  providers: [NewsService],
})
export class NewsModule {}
