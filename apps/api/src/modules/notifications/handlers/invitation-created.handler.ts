import { Inject, Logger } from '@nestjs/common';
import { EventsHandler, IEventHandler } from '@nestjs/cqrs';
import {
  EnvironmentVariables,
  VerificationValue,
  FrontendRoutes,
} from '../../../libs/constants';
import { TokenService } from '../../auth/token.service';
import { InvitationCreatedEvent } from '../../verifications/events/invitation-created.event';
import { NotificationsService } from '../notifications.service';
import { invitationEmail } from '../templates/invitation';
import { ConfigService } from '@nestjs/config';

@EventsHandler(InvitationCreatedEvent)
export class InvitationCreatedHandler implements IEventHandler<InvitationCreatedEvent> {
  private readonly logger: Logger = new Logger(InvitationCreatedHandler.name);
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(NotificationsService)
    private readonly notificationsService: NotificationsService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
  ) {}

  async handle(event: InvitationCreatedEvent) {
    this.logger.debug('handle invoked', {
      correlationId: 'c5ea5bf0-3b79-4ba2-814a-0b31608ec7cc',
      event,
    });
    const { entity } = event;
    const frontendUrl = this.configService.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;

    const payload: VerificationValue = await this.tokenService.verify(
      entity.value,
    );

    const expiresAt = entity.expiresAt;
    const url = `${frontendUrl}${FrontendRoutes.ONBOARDING_AUTH}?token=${encodeURIComponent(entity.identifier)}`;
    await this.notificationsService.sendEmail({
      to: payload.to,
      subject: invitationEmail.subject,
      text: invitationEmail.text({ url, expiresAt: expiresAt.toString() }),
      html: invitationEmail.html({ url, expiresAt: expiresAt.toString() }),
    });
    return;
  }
}
