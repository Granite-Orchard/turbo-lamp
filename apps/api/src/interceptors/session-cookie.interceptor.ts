import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
  Inject,
  Logger,
} from '@nestjs/common';
import { tap } from 'rxjs';
import express from 'express';
import { CookieService } from '../modules/auth/cookie.service';
import { CookieKey } from '../libs/constants';

@Injectable()
export class SessionCookieInterceptor implements NestInterceptor {
  private readonly logger: Logger = new Logger(SessionCookieInterceptor.name);
  constructor(
    @Inject(CookieService)
    private readonly cookieService: CookieService,
  ) {}
  intercept(context: ExecutionContext, next: CallHandler) {
    const res: express.Response = context.switchToHttp().getResponse();
    this.logger.debug('intercept invoked', {
      correlationId: '3d9eeb34-1d34-4374-ae75-0f5951cc7db2',
    });

    return next.handle().pipe(
      tap((data: { token?: string }) => {
        if (data?.token) {
          this.logger.debug('token exists, attatching cookie to response.', {
            correlationId: '6822052f-2d4e-474b-9082-99a9165cb2e3',
          });
          this.cookieService.attachCookie(res, CookieKey.SESSION, data.token);
        }
      }),
    );
  }
}
