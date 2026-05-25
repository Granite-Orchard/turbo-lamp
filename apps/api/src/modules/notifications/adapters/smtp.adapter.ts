import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as nodemailer from 'nodemailer';
import { EnvironmentVariables } from '../../../libs/constants';
import { Mailer, SendEmailParams } from '../mailer.interface';

@Injectable()
export class SmtpMailer implements Mailer {
  private readonly logger: Logger = new Logger(SmtpMailer.name);
  private readonly from: string;
  private readonly transport: nodemailer.Transporter;
  constructor(private readonly configService: ConfigService) {
    const url = this.configService.get<string>(EnvironmentVariables.SMTP_URL)!;
    if (!url) throw new Error('Missing SMTP_URL');
    this.transport = nodemailer.createTransport({
      url,
    });

    const from = this.configService.get<string>(
      EnvironmentVariables.SMTP_FROM_EMAIL,
    )!;
    if (!from) throw new Error('Missing SMTP_FROM_EMAIL');

    this.from = from;
  }

  async sendEmail(params: SendEmailParams) {
    this.logger.debug('sendEmail invoked', {
      correlationId: '4488cf58-807b-46e6-9bbc-6ebee9d6278e',
      params,
    });
    await this.transport.sendMail({
      ...params,
      from: this.from,
    });
  }
}
