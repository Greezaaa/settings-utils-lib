import {
  Body,
  Controller,
  Get,
  Header,
  HttpCode,
  Param,
  Put,
  UseGuards,
} from '@nestjs/common';
import { z } from 'zod';
import { SuperAdminGuard } from '../security/admin.guard.js';
import type { FeatureId } from '../shared/catalog.js';
import { featureSchema } from '../shared/catalog.js';
import { FeatureFlagsService, FeatureSwitch } from './feature-flags.service.js';

const switchSchema = z.object({ enabled: z.boolean() });
type SwitchInput = z.infer<typeof switchSchema>;

/** Which features are open to the public, read by the games site when it starts */
@Controller('v1/features')
export class FeatureFlagsController {
  constructor(private readonly flags: FeatureFlagsService) {}

  /** Never cached: a switch the admin changes counts from the next read */
  @Get()
  @Header('Cache-Control', 'no-store')
  async list(): Promise<{ features: FeatureSwitch[] }> {
    return { features: await this.flags.list() };
  }
}

/** For the super admin: open or close a feature */
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
