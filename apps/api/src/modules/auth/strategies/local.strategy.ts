import {
  Inject,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy } from 'passport-local';
import { AccountProvider } from '../../../libs/constants';
import { Account } from '../../accounts/entities/account.entity';
import { AuthService } from '../auth.service';

@Injectable()
export class LocalStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(LocalStrategy.name);
  constructor(
    @Inject(AuthService)
    private readonly authService: AuthService,
  ) {
    super();
  }

  async validate(username: string, password: string): Promise<Account> {
    this.logger.debug('validate invoked', {
      correlationId: 'ce3f1b34-fde2-488c-9fd2-84a459e061c9',
      username,
    });
    const account = await this.authService.validateUser(
      username,
      AccountProvider.CREDENTIALS,
      password,
    );
    if (!account) {
      throw new UnauthorizedException();
    }
    return account;
  }
}
