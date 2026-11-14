import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { NewsItem, NewsText } from './news-item.entity.js';
import { NewsInput } from './news.schema.js';

export interface NewsView {
  readonly id: number;
  readonly version: number;
  readonly published: string;
  readonly kind: string;
  readonly game: string | null;
  readonly feature: string | null;
  readonly privacy: boolean;
  readonly text: NewsText;
}

const view = ({ id, version, published, kind, game, feature, privacy, text }: NewsItem): NewsView => ({
  id,
  version,
  published: published.toISOString(),
  kind,
  game,
  feature,
  privacy,
  text,
});

const withoutEmpty = (text: NewsInput['text']): NewsText =>
  Object.fromEntries(Object.entries(text).filter(([, value]) => value));

@Injectable()
export class NewsService {
  constructor(
    @InjectRepository(NewsItem)
    private readonly news: Repository<NewsItem>,
  ) {}

  async list(): Promise<NewsView[]> {
    const items = await this.news.find({ order: { version: 'DESC', id: 'ASC' } });
    return items.map(view);
  }

  async add(input: NewsInput): Promise<NewsView> {
    const latest = await this.news.maximum('version');
    const item = await this.news.save(
      this.news.create({ ...input, published: new Date(input.published), text: withoutEmpty(input.text), version: (latest ?? 0) + 1 }),
    );
    return view(item);
  }

  async change(id: number, input: NewsInput): Promise<NewsView> {
    const item = await this.news.findOneBy({ id });
    if (!item) {
      throw new NotFoundException();
    }
    Object.assign(item, { ...input, published: new Date(input.published), text: withoutEmpty(input.text) });
    return view(await this.news.save(item));
  }

  async remove(id: number): Promise<void> {
    await this.news.delete({ id });
  }
}
