import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import type { Request } from 'express';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { AccountsService } from '../../accounts/accounts.service';
import { Account } from '../../accounts/entities/account.entity';
import { TokenSchema } from '../token.service';
import {
  EnvironmentVariables,
  TOKEN_ALGORITHM,
  TOKEN_ISSUER,
  TOKEN_AUDIENCE,
} from '../../../libs/constants';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  private readonly logger: Logger = new Logger(JwtStrategy.name);
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(AccountsService)
    private readonly accountService: AccountsService,
  ) {
    const privateKey = configService.get<string>(
      EnvironmentVariables.JWT_PRIVATE,
    )!;
    super({
      jwtFromRequest: ExtractJwt.fromExtractors([
        ExtractJwt.fromAuthHeaderAsBearerToken(),
        (req: Request): string | null => {
          if (!req?.cookies) return null;
          return typeof req.cookies.session === 'string'
            ? req.cookies.session
            : null;
        },
      ]),
      secretOrKey: privateKey,
      algorithms: [TOKEN_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
  }

  async validate(payload: TokenSchema): Promise<Account | null> {
    this.logger.debug('validate invoked', {
      correlationId: 'ac50730a-3e20-4838-bec9-6be0c0831249',
      payload,
    });
    const account = await this.accountService.findOneBy(
      {
        providerId: payload.provider,
        user: { id: payload.sub, email: payload.username },
      },
      {
        user: true,
      },
    );

    if (!account) {
      return null;
    }
    return account;
  }
}
