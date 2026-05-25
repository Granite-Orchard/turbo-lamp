import { Inject, Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import {
  AccountProvider,
  EnvironmentVariables,
  PROVIDERS,
} from '../../../libs/constants';
import { AccountsService } from '../../accounts/accounts.service';
import { Account } from '../../accounts/entities/account.entity';
import { UsersService } from '../../users/users.service';
import { AuthService } from '../auth.service';
import { ExternalCalendarService } from '../../calendars/external-calendar.service';

const PROVIDER: PROVIDERS = 'google';
const SCOPES = ['email', 'profile', 'https://www.googleapis.com/auth/calendar'];

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, PROVIDER) {
  private readonly logger: Logger = new Logger(GoogleStrategy.name);
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(AccountsService)
    private readonly accountService: AccountsService,
    @Inject(UsersService)
    private readonly userService: UsersService,
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {
    super({
      clientID: configService.get<string>(
        EnvironmentVariables.GOOGLE_CLIENT_ID,
      )!,
      clientSecret: configService.get<string>(
        EnvironmentVariables.GOOGLE_CLIENT_SECRET,
      )!,
      callbackURL: configService.get<string>(
        EnvironmentVariables.GOOGLE_CALLBACK_URL,
      )!,
      scope: SCOPES,
    });
  }

  authorizationParams() {
    this.logger.debug('authorizationParams invoked', {
      correlationId: '443e0402-9570-45b9-8c00-5d1c4500ab98',
    });
    return {
      access_type: 'offline',
      prompt: 'consent',
      session: 'false',
    };
  }

  async validate(
    accessToken: string,
    refreshToken: string,
    profile: Profile,
  ): Promise<Account> {
    this.logger.debug('validate invoked', {
      correlationId: '2e3b97c2-6d89-4e78-8449-8338d8081040',
    });
    const { value: email } = profile.emails![0];
    let account = await this.authService.validateUser(
      email,
      AccountProvider.GOOGLE,
    );

    if (account) {
      this.logger.debug('account exists. updating access token', {
        correlationId: 'a119c391-fa33-4641-94f0-6f0581a51c13',
        accountId: account.id,
      });
      account.accessToken = accessToken;
      account.accessTokenExpiresAt = new Date(Date.now() + 3600 * 1000);
      if (refreshToken) {
        account.refreshToken = refreshToken;
      }

      await this.accountService.update(account.id, account);
      return account;
    }

    this.logger.debug('account does not exist. creating account and user', {
      correlationId: 'a670e342-f0ac-47fc-843b-209c8f563c86',
    });

    const user = await this.userService.create({
      name: profile.displayName,
      email,
      image: profile.photos![0].value,
      emailVerified: true,
    });
    account = await this.accountService.create({
      userId: user.id,
      accountId: profile.id,
      providerId: AccountProvider.GOOGLE,
      scope: SCOPES.join(','),
      accessToken,
      refreshToken,
      accessTokenExpiresAt: new Date(Date.now() + 3600 * 1000),
    });
    user.timezone = await this.externalCalendarService.getTimezone(
      AccountProvider.GOOGLE,
      { account },
    );
    await this.userService.update(user.id, { timezone: user.timezone });

    // TODO: is this still needed?
    user.calendars = [];
    account.user = user;
    return account;
  }
}
