import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService, JwtSignOptions, JwtVerifyOptions } from '@nestjs/jwt';
import {
  AccountProvider,
  EnvironmentVariables,
  TOKEN_ALGORITHM,
  TOKEN_AUDIENCE,
  TOKEN_ISSUER,
} from '../../libs/constants';
import { randomBytes } from 'crypto';

export interface TokenSchema {
  sub: string;
  username: string;
  provider: AccountProvider;
}

@Injectable()
export class TokenService {
  private readonly logger: Logger = new Logger(TokenService.name);
  constructor(
    @Inject(JwtService)
    private jwtService: JwtService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  randomHash() {
    this.logger.debug('randomHash invoked', {
      correlationId: 'b70283bc-00e7-4628-ad7d-3fbaa481da13',
    });
    return randomBytes(32).toString('base64url');
  }

  verify<T extends object = any>(token: string, options?: JwtVerifyOptions): T {
    this.logger.debug('verify invoked', {
      correlationId: '18b3efc6-6ce5-45fe-bcb3-72be5c3f4fe4',
    });
    const publicKey = this.configService.get<string>(
      EnvironmentVariables.JWT_PUBLIC,
    )!;
    return this.jwtService.verify<T>(token, {
      ...options,
      publicKey,
      algorithms: [TOKEN_ALGORITHM],
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
  }

  sign<T extends object = any>(payload: T, options?: JwtSignOptions): string {
    this.logger.debug('sign invoked', {
      correlationId: '6cb74b2c-1c86-405e-8253-cdde93468a40',
    });
    const privateKey = this.configService.get<string>(
      EnvironmentVariables.JWT_PRIVATE,
    )!;
    return this.jwtService.sign(payload, {
      ...options,
      privateKey,
      algorithm: TOKEN_ALGORITHM,
      issuer: TOKEN_ISSUER,
      audience: TOKEN_AUDIENCE,
    });
  }
}
