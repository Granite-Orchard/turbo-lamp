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
export class OAuthRegisterInitiationGuard implements CanActivate {
  private readonly logger: Logger = new Logger(
    OAuthRegisterInitiationGuard.name,
  );
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
      correlationId: '8c3d36df-c94d-4ee6-9601-efa4753b4410',
      provider,
    });

    if (!STRATEGIES.includes(provider)) {
      throw new UnauthorizedException();
    }

    const guard = new (AuthGuard(provider))();

    this.logger.debug('canActivate auth provider located', {
      correlationId: '41b48fff-2265-48d1-bf96-be2e0c804bd9',
      provider,
    });

    const value: VerificationValue = {
      type: VerificationType.OAUTH_STATE,
      id: '',
      to: '',
      after: SanitizedRoutes.ONBOARDING,
    };

    if (req.query?.token) {
      this.logger.debug('token exists in query object', {
        correlationId: 'c81d2df6-262c-4086-99df-71319e021032',
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
