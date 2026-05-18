import {
  Body,
  Controller,
  Get,
  Inject,
  Ip,
  Logger,
  Post,
  Query,
  Req,
  Res,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { plainToInstance } from 'class-transformer';
import type { Request } from 'express';
import express from 'express';
import { LocalAuthGuard } from '../../guards/local-auth.guard';
import { OAuthGuard } from '../../guards/oauth-auth.guard';
import { OAuthInitiationGuard } from '../../guards/oauth-initiation.guard';
import { OAuthRegisterInitiationGuard } from '../../guards/oauth-register-initiation.guard';
import { SessionCookieInterceptor } from '../../interceptors/session-cookie.interceptor';
import {
  AccountProvider,
  CookieKey,
  EnvironmentVariables,
  SanitizedRoutes,
  VerificationValue,
} from '../../libs/constants';
import { Account } from '../accounts/entities/account.entity';
import { InvitationsService } from '../invitations/invitations.service';
import { VerificationsService } from '../verifications/verifications.service';
import { AuthService } from './auth.service';
import { CookieService } from './cookie.service';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';
import { SessionResponseDto } from './dto/session.response.dto';
import { TokenService } from './token.service';
import { Throttle } from '@nestjs/throttler';

@Throttle({ default: { limit: 3, ttl: 60_000 } })
@Controller({ path: 'auth', version: '1' })
export class AuthController {
  private readonly logger: Logger = new Logger(AuthController.name);
  constructor(
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(AuthService)
    private readonly authService: AuthService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(VerificationsService)
    private readonly verificationService: VerificationsService,
    @Inject(CookieService)
    private readonly cookieService: CookieService,
    @Inject(InvitationsService)
    private readonly invitationsService: InvitationsService,
  ) {}

  @UseInterceptors(SessionCookieInterceptor)
  @Post('register')
  async register(
    @Req() req: Request,
    @Ip() ip: string,
    @Body() body: RegisterDto,
  ): Promise<SessionResponseDto> {
    const result = await this.authService.register(body, {
      userAgent: req.headers['user-agent'],
      ip,
    });

    return plainToInstance(SessionResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseInterceptors(SessionCookieInterceptor)
  @UseGuards(LocalAuthGuard)
  @Post('login')
  async login(
    @Req() req: Request,
    @Ip() ip: string,
    @Body() body: LoginDto,
  ): Promise<SessionResponseDto> {
    const account = await this.authService.validateUser(
      body.username,
      AccountProvider.CREDENTIALS,
      body.password,
    );
    if (!account) {
      throw new UnauthorizedException();
    }
    const result = await this.authService.login(account, {
      userAgent: req.headers['user-agent'],
      ip,
    });

    return plainToInstance(SessionResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(OAuthRegisterInitiationGuard)
  @Get('oauth/register/:provider')
  getRegisterProvider() {}

  @UseGuards(OAuthInitiationGuard)
  @Get('oauth/:provider')
  getProvider() {}

  @UseGuards(OAuthGuard)
  @Get('oauth/callback/:provider')
  async getProviderCallback(
    @Query('state') state: string,
    @Req() req: Request & { user: Account },
    @Ip() ip: string,
    @Res() res: express.Response,
  ) {
    const verification = await this.verificationService.consume(state);

    if (!verification) {
      throw new UnauthorizedException();
    }

    const hasCalendars = req.user.calendars && req.user.calendars.length > 0;
    let redirect: string = hasCalendars
      ? SanitizedRoutes.MEETING_GROUPS
      : SanitizedRoutes.ONBOARDING;

    if (verification.value !== '') {
      const payload = this.tokenService.verify<VerificationValue>(
        verification.value,
      );
      const base = payload.after;
      if (!base) throw new UnauthorizedException();

      redirect = `${base}`;
      // TODO:... abstract to invitation service for better handling?
      if (base === SanitizedRoutes.MEETING_INVITATION_ACCEPTED) {
        await this.invitationsService.acceptInvitation(payload.id, req.user);
        redirect = SanitizedRoutes.ONBOARDING;
      }
    }

    const session = await this.authService.login(req.user, {
      userAgent: req.headers['user-agent'],
      ip,
    });

    this.cookieService.attachCookie(res, CookieKey.SESSION, session.token);

    const frontendUrl = this.configService.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;
    res.redirect(`${frontendUrl}/${redirect}`);
  }
}
