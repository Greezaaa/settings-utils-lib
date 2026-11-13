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

@Module({})
export class CoreModule {
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
        ThrottlerModule.forRoot([{ ttl: 60_000, limit: 60 }]),
        AuthModule,
      ],
      controllers: [HealthController],
      providers: [{ provide: APP_GUARD, useClass: VisitorThrottlerGuard }],
    };
  }
}
