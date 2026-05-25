import {
  CanActivate,
  ExecutionContext,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import type { Request } from 'express';
import { PROVIDERS, STRATEGIES } from '../libs/constants';

@Injectable()
export class OAuthGuard implements CanActivate {
  private readonly logger: Logger = new Logger(OAuthGuard.name);
  async canActivate(context: ExecutionContext): Promise<boolean> {
    const req: Request & {
      params: { provider: PROVIDERS };
    } = context.switchToHttp().getRequest();

    this.logger.debug('canActivate invoked with provider', {
      correlationId: 'fc7aaed1-1bc8-41b7-98fa-fdc222308fff',
      provider: req.params.provider,
    });

    const provider = req.params.provider;

    if (!STRATEGIES.includes(provider)) {
      throw new UnauthorizedException();
    }

    const guard = new (AuthGuard(provider))();
    this.logger.debug('canActivate auth guard found', {
      correlationId: 'a4584f51-d066-4d26-bf0f-7fbecd496172',
      provider,
    });
    return guard.canActivate(context) as Promise<boolean>;
  }
}
