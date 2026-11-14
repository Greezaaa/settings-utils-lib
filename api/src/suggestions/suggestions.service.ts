import { randomUUID } from 'node:crypto';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import type { Env } from '../config/env.js';
import type { Page } from '../shared/page.js';
import { cleanImage } from '../shared/clean-image.js';
import { Suggestion } from './suggestion.entity.js';
import { StatusInput, SuggestionInput, SuggestionStatus } from './suggestions.schema.js';

@Injectable()
export class SuggestionsService implements OnModuleInit {
  private readonly uploadsDir: string;

  constructor(
    @InjectRepository(Suggestion)
    private readonly suggestions: Repository<Suggestion>,
    config: ConfigService<Env, true>,
  ) {
    this.uploadsDir = config.get('UPLOADS_DIR', { infer: true });
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.uploadsDir, { recursive: true });
  }

  async add(
    { category, text, language }: SuggestionInput,
    image?: Buffer,
  ): Promise<void> {
    let imageName: string | null = null;
    if (image) {
      imageName = `${randomUUID()}.webp`;
      await writeFile(
        join(this.uploadsDir, imageName),
        await cleanImage(image),
      );
    }
    await this.suggestions.insert({
      category,
      text,
      language,
      image: imageName,
    });
  }

  list(
    status: SuggestionStatus,
    { offset, limit }: Page,
  ): Promise<Suggestion[]> {
    return this.suggestions.find({
      where: { status },
      order: { created: 'DESC', id: 'ASC' },
      skip: offset,
      take: limit,
    });
  }

  async image(id: string): Promise<Buffer> {
    const suggestion = await this.find(id);
    if (!suggestion.image) {
      throw new NotFoundException();
    }
    return readFile(join(this.uploadsDir, suggestion.image));
  }

  async setStatus(id: string, { status }: StatusInput): Promise<void> {
    await this.find(id);
    await this.suggestions.update({ id }, { status });
  }

  async remove(id: string): Promise<void> {
    const suggestion = await this.find(id);
    if (suggestion.image) {
      await rm(join(this.uploadsDir, suggestion.image), { force: true });
    }
    await this.suggestions.delete({ id });
  }

  private async find(id: string): Promise<Suggestion> {
    const suggestion = await this.suggestions.findOneBy({ id });
    if (!suggestion) {
      throw new NotFoundException();
    }
    return suggestion;
  }
}
