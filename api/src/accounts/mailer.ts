import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createTransport, Transporter } from 'nodemailer';
import type { Env } from '../config/env.js';

@Injectable()
export class Mailer {
  private readonly logger = new Logger(Mailer.name);
  private readonly transport: Transporter | null;
  private readonly from: string;

  constructor(config: ConfigService<Env, true>) {
    const url = config.get('SMTP_URL', { infer: true });
    this.transport = url ? createTransport(url) : null;
    this.from = config.get('MAIL_FROM', { infer: true });
  }

  get isAvailable(): boolean {
    return this.transport !== null;
  }

  async send(to: string, subject: string, text: string): Promise<void> {
    try {
      await this.transport?.sendMail({ from: this.from, to, subject, text });
    } catch (error) {
      this.logger.error(
        `Email not sent: ${error instanceof Error ? error.message : 'unknown error'}`,
      );
    }
  }
}
