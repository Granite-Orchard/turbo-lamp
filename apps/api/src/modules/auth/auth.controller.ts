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
import { Throttle } from '@nestjs/throttler';
import { plainToInstance } from 'class-transformer';
import type { Request, Response } from 'express';
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
    this.logger.debug('login invoked', {
      correlationId: 'c3d48937-db7c-4bc6-b75e-6d2ba8cb68a2',
    });
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
  getRegisterProvider() {
    this.logger.debug('getRegisterProvider invoked', {
      correlationId: '18047f6e-a9d9-43cc-a6b3-a2c4d23f92c1',
    });
  }

  @UseGuards(OAuthInitiationGuard)
  @Get('oauth/:provider')
  getProvider() {
    this.logger.debug('getProvider invoked', {
      correlationId: 'b33d85d3-ada7-49bb-ae49-3b9ed9569c7b',
    });
  }

  @UseGuards(OAuthGuard)
  @Get('oauth/callback/:provider')
  async getProviderCallback(
    @Query('state') state: string,
    @Req() req: Request & { user: Account },
    @Ip() ip: string,
    @Res() res: Response,
  ) {
    this.logger.debug('getProviderCallback invoked', {
      correlationId: '9f59eed1-7cad-4b2f-8007-941ec41d0d44',
    });
    const verification = await this.verificationService.consume(state);

    if (!verification) {
      throw new UnauthorizedException();
    }

    const hasCalendars = req.user.calendars && req.user.calendars.length > 0;
    let redirect: string = hasCalendars
      ? SanitizedRoutes.MEETING_GROUPS
      : SanitizedRoutes.ONBOARDING;

    if (verification.value !== '') {
      this.logger.debug('verification has value, verifying', {
        correlationId: '7e592a9a-8cbc-4d74-8e25-18578f3d3aae',
      });
      const payload = this.tokenService.verify<VerificationValue>(
        verification.value,
      );
      const base = payload.after;
      if (!base) throw new UnauthorizedException();

      redirect = `${base}`;
      if (base === SanitizedRoutes.MEETING_INVITATION_ACCEPTED) {
        await this.invitationsService.acceptInvitation(payload.id, req.user);
      }
      this.logger.debug('verified redirect', {
        correlationId: '96623b36-38b9-4571-b0f3-e4f93d439a93',
        redirect,
      });
    }

    const session = await this.authService.login(req.user, {
      userAgent: req.headers['user-agent'],
      ip,
    });

    this.cookieService.attachCookie(res, CookieKey.SESSION, session.token);

    const frontendUrl = this.configService.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;
    this.logger.debug('callback complete, cookie set, redirecting', {
      correlationId: '9610d314-4b7c-4305-9df0-b16485671117',
      frontendUrl,
      redirect,
    });
    res.redirect(`${frontendUrl}/${redirect}`);
  }
}
