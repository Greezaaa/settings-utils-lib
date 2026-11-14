import { Body, Controller, Get, Header, HttpCode, Param, Put, UseGuards } from '@nestjs/common';
import { z } from 'zod';
import { SuperAdminGuard } from '../security/admin.guard.js';
import type { FeatureId } from '../shared/catalog.js';
import { featureSchema } from '../shared/catalog.js';
import { FeatureFlagsService, FeatureSwitch } from './feature-flags.service.js';

const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;

@Controller('v1/features')
export class FeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Get()
  @Header('Cache-Control', 'no-cache')
  async list(): Promise<{ features: FeatureSwitch[] }> {
    return { features: await this.flags.list() };
  }
}

@Controller('admin/features')
@UseGuards(SuperAdminGuard)
export class FeatureFlagsAdminController {
  constructor(private readonly flags: FeatureFlagsService) {}

  @Put(':feature')
  @HttpCode(204)
  async set(
    @Param('feature', { schema: featureSchema }) feature: FeatureId,
    @Body({ schema: switchSchema }) { enabled }: SwitchInput,
  ): Promise<void> {
    await this.flags.set(feature, enabled);
  }
}
