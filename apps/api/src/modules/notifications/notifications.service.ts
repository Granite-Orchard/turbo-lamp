import { Injectable, Inject, Logger } from '@nestjs/common';
import { MAILER, type Mailer, type SendEmailParams } from './mailer.interface';

@Injectable()
export class NotificationsService {
  private readonly logger: Logger = new Logger(NotificationsService.name);
  constructor(@Inject(MAILER) private readonly mailer: Mailer) {}

  sendEmail(params: SendEmailParams) {
    this.logger.debug('sendEmail invoked', {
      correlationId: '85b89a9c-02c9-4850-8bf6-99b577580e34',
      params,
    });
    return this.mailer.sendEmail(params);
  }
}
