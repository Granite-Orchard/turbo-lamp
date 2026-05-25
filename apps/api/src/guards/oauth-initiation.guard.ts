import {
  CanActivate,
  ExecutionContext,
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import {
  PROVIDERS,
  SanitizedRoutes,
  STRATEGIES,
  VerificationType,
  VerificationValue,
} from '../libs/constants';
import { TokenService } from '../modules/auth/token.service';
import { VerificationsService } from '../modules/verifications/verifications.service';

@Injectable()
export class OAuthInitiationGuard implements CanActivate {
  private readonly logger: Logger = new Logger(OAuthInitiationGuard.name);
  constructor(
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(VerificationsService)
    private readonly verificationService: VerificationsService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & {
      params: { provider: PROVIDERS };
      query?: { token?: string };
    } = context.switchToHttp().getRequest();

    const provider = req.params.provider;

    this.logger.debug('canActivate invoked with provider', {
      correlationId: '2150d5fe-812e-4084-9a61-e578d47cc42a',
      provider,
    });

    if (!STRATEGIES.includes(provider)) {
      throw new UnauthorizedException();
    }

    const guard = new (AuthGuard(provider))();

    this.logger.debug('canActivate auth provider found', {
      correlationId: '8d392930-2cda-44aa-b9bf-77dd3b548842',
      provider,
    });

    const value: VerificationValue = {
      type: VerificationType.OAUTH_STATE,
      id: '',
      to: '',
      after: SanitizedRoutes.MEETING_GROUPS,
    };

    if (req.query?.token) {
      this.logger.debug('canActivate token exists in query, consuming', {
        correlationId: 'b3a50e35-041f-4f19-9395-19b95c3b35c7',
      });
      const token = await this.verificationService.consume(req.query.token);

      if (!token) {
        throw new UnauthorizedException();
      }

      if (new Date() >= token.expiresAt) {
        throw new UnauthorizedException();
      }

      const payload = this.tokenService.verify<VerificationValue>(token.value);
      if (!Object.values(VerificationType).includes(payload.type)) {
        throw new UnauthorizedException();
      }
      value.id = payload.id;
      value.to = payload.to;
      value.after = payload.after;
    }

    this.logger.debug('Generating verification', {
      correlationId: 'ed6bf907-e8d5-46ee-bb44-2b6bfdc5e554',
    });

    const expiresIn = 300000;
    // 5 minutes
    const expiresAt = new Date(Date.now() + expiresIn);
    const verification = await this.verificationService.create({
      identifier: this.tokenService.randomHash(),
      value: this.tokenService.sign(value, { expiresIn }),
      expiresAt,
    });

    this.logger.debug('Verification expires at', {
      expiresAt,
      correlationId: 'ed6bf907-e8d5-46ee-bb44-2b6bfdc5e554',
    });

    guard.getAuthenticateOptions = () => ({
      session: false,
      state: verification.identifier,
    });

    return guard.canActivate(context) as Promise<boolean>;
  }
}
