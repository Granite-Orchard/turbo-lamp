import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EnvironmentVariables } from '../../../libs/constants';
import { AccountsService } from '../../accounts/accounts.service';
import { Account } from '../../accounts/entities/account.entity';
import { GoogleTokenService } from '../google-token.service';

@Injectable()
export class GoogleAuthManager {
  private readonly logger: Logger = new Logger(GoogleAuthManager.name);
  constructor(
    private readonly config: ConfigService,
    private readonly accountService: AccountsService,
    private readonly tokenService: GoogleTokenService,
  ) {}

  async getValidAccessToken(account: Account): Promise<string> {
    this.logger.debug('getValidAccessToken invoked', {
      correlationId: '873f42db-c7c2-430e-ad8c-46e70d95e31a',
      accountId: account.id,
    });
    const now = Date.now();
    const expired =
      !account.accessTokenExpiresAt ||
      account.accessTokenExpiresAt.getTime() <= now;

    this.logger.debug('token expired boolean', {
      correlationId: 'da58bce1-0747-4aa4-a98e-ae5101f95a07',
      expired,
    });

    if (!expired) return account.accessToken!;

    const refreshed = await this.tokenService.refreshAccessToken({
      clientId: this.config.get(EnvironmentVariables.GOOGLE_CLIENT_ID)!,
      clientSecret: this.config.get(EnvironmentVariables.GOOGLE_CLIENT_SECRET)!,
      refreshToken: account.refreshToken!,
    });

    this.logger.debug('token refreshed', {
      correlationId: '252eaf1e-a53d-4d71-ac24-eefd3f3bef2e',
      accountId: account.id,
    });

    const newExpires = new Date(Date.now() + refreshed.expiresIn * 1000);
    account.accessToken = refreshed.accessToken;
    account.accessTokenExpiresAt = newExpires;

    await this.accountService.update(account.id, {
      accessToken: refreshed.accessToken,
      accessTokenExpiresAt: newExpires,
    });

    return account.accessToken;
  }
}
