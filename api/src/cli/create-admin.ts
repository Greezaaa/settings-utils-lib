import { NestFactory } from '@nestjs/core';
import { z } from 'zod';
import { AppModule } from '../app.module.js';
import { TeamService } from '../auth/team.service.js';

async function createSuperAdmin(): Promise<void> {
  const email = z.email().safeParse(process.argv[2]?.trim());
  if (!email.success) {
    console.error('Usage: node dist/cli/create-admin.js <email>');
    process.exitCode = 1;
    return;
  }
  const app = await NestFactory.createApplicationContext(AppModule, {
    logger: ['error'],
  });
  const password = await app.get(TeamService).createSuperAdmin(email.data);
  await app.close();
  console.log(
    `Super admin ${email.data} can sign in with this password (shown only now; change it after signing in):`,
  );
  console.log(password);
}

await createSuperAdmin();
