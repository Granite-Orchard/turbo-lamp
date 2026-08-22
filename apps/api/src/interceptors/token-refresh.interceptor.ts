import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { JwtService } from '@nestjs/jwt';
import { tap } from 'rxjs';
import type { Request, Response } from 'express';
import { CookieService } from '../modules/auth/cookie.service';
import { TokenSchema, TokenService } from '../modules/auth/token.service';
import { SessionsService } from '../modules/sessions/sessions.service';
import { CookieKey, EnvironmentVariables } from '../libs/constants';

const REFRESH_THRESHOLD_MS = 900_000;

@Injectable()
export class TokenRefreshInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(TokenRefreshInterceptor.name);
  constructor(
    @Inject(JwtService)
    private readonly jwtService: JwtService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(CookieService)
    private readonly cookieService: CookieService,
    @Inject(SessionsService)
    private readonly sessionService: SessionsService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req: Request = context.switchToHttp().getRequest();
    const res: Response = context.switchToHttp().getResponse();

    const token = this.extractToken(req);
    if (!token) {
      return next.handle();
    }

    return next.handle().pipe(
      tap(() => {
        void (async () => {
          try {
            const decoded = this.jwtService.decode<
              TokenSchema & { exp: number }
            >(token);
            if (!decoded?.exp) {
              return;
            }

            const now = Date.now();
            const expiresAtMs = decoded.exp * 1000;
            if (expiresAtMs - now >= REFRESH_THRESHOLD_MS) {
              return;
            }

            const token_ttl = this.configService.get<number>(
              EnvironmentVariables.TOKEN_TTL,
            )!;

            const newExpiresAt = new Date(now + token_ttl * 1000);
            const newToken = this.tokenService.sign(
              {
                sub: decoded.sub,
                username: decoded.username,
                provider: decoded.provider,
              },
              { expiresIn: token_ttl * 1000 },
            );

            this.cookieService.attachCookie(res, CookieKey.SESSION, newToken);

            const session = await this.sessionService.findOneBy({ token });
            if (session) {
              await this.sessionService.update(session.id, {
                token: newToken,
                expiresAt: newExpiresAt,
              });
            }

            this.logger.debug('token refreshed', {
              correlationId: 'a1b2c3d4-e5f6-7890-abcd-ef1234567890',
              userId: decoded.sub,
            });
          } catch (err) {
            this.logger.warn('token refresh failed', {
              correlationId: 'b2c3d4e5-f6a7-8901-bcde-f12345678901',
              error: err instanceof Error ? err.message : String(err),
            });
          }
        })();
      }),
    );
  }

  private extractToken(req: Request): string | null {
    const header = req.headers.authorization;
    if (header?.startsWith('Bearer ')) {
      return header.slice('Bearer '.length);
    }
    const cookies = (req as Request & { cookies?: Record<string, string> })
      .cookies;
    return typeof cookies?.session === 'string' ? cookies.session : null;
  }
}
