import { DynamicModule, Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { APP_GUARD } from '@nestjs/core';
import { ThrottlerModule } from '@nestjs/throttler';
import { TypeOrmModule } from '@nestjs/typeorm';
import { AuthModule } from './auth/auth.module.js';
import { Env, validateEnv } from './config/env.js';
import { databaseOptions } from './database/database.options.js';
import { HealthController } from './health/health.controller.js';
import { VisitorThrottlerGuard } from './security/visitor-throttler.guard.js';

/**
 * What api.su-labs.dev and auth.su-labs.dev share: the environment, the database, the rate limits, the health check and
 * the admin sessions (whose guards protect both). Each process adds its own endpoints on top.
 */
@Module({})
export class CoreModule {
  /** `runMigrations`: only the API changes the tables, so two processes never migrate at once */
  static forRoot({ runMigrations }: { runMigrations: boolean }): DynamicModule {
    return {
      module: CoreModule,
      imports: [
        ConfigModule.forRoot({ isGlobal: true, validate: validateEnv }),
        TypeOrmModule.forRootAsync({
          inject: [ConfigService],
          useFactory: (config: ConfigService<Env, true>) =>
            databaseOptions(
              config.get('DATABASE_URL', { infer: true }),
              runMigrations,
            ),
        }),
        // Every endpoint: at most 60 requests a minute per visitor; endpoints that write have tighter limits
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
        AuthModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: VisitorThrottlerGuard }],
    };
  }
}
