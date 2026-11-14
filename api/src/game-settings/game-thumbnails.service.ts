import { Injectable, NotFoundException, OnModuleInit } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { mkdir, readFile, rm, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Repository } from 'typeorm';
import type { Env } from '../config/env.js';
import { GameSlug } from '../shared/catalog.js';
import { cleanImage } from '../shared/clean-image.js';
import { GameThumbnail } from './game-thumbnail.entity.js';

const THUMBNAIL_SIDE = 640;

export interface ThumbnailVersion {
  readonly game: string;
  readonly version: number;
}

@Injectable()
export class GameThumbnailsService implements OnModuleInit {
  private readonly folder: string;

  constructor(
    @InjectRepository(GameThumbnail)
    private readonly thumbnails: Repository<GameThumbnail>,
    config: ConfigService<Env, true>,
  ) {
    this.folder = join(config.get('UPLOADS_DIR', { infer: true }), 'thumbnails');
  }

  async onModuleInit(): Promise<void> {
    await mkdir(this.folder, { recursive: true });
  }

  async list(): Promise<ThumbnailVersion[]> {
    const rows = await this.thumbnails.find({ order: { game: 'ASC' } });
    return rows.map(({ game, updated }) => ({ game, version: updated.getTime() }));
  }

  async read(game: GameSlug): Promise<Buffer> {
    if (!(await this.thumbnails.existsBy({ game }))) {
      throw new NotFoundException();
    }
    return readFile(this.fileOf(game));
  }

  async save(game: GameSlug, image: Buffer): Promise<void> {
    await writeFile(this.fileOf(game), await cleanImage(image, THUMBNAIL_SIDE));
    await this.thumbnails.upsert({ game, updated: new Date() }, ['game']);
  }

  async remove(game: GameSlug): Promise<void> {
    await this.thumbnails.delete({ game });
    await rm(this.fileOf(game), { force: true });
  }

  private fileOf(game: GameSlug): string {
    return join(this.folder, `${game}.webp`);
  }
}
