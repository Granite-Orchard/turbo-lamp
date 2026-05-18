import { Response } from 'express';
import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { EnvironmentVariables } from '../../libs/constants';

@Injectable()
export class CookieService {
  private readonly logger: Logger = new Logger(CookieService.name);
  constructor(private readonly config: ConfigService) {}

  attachCookie(
    response: Response,
    name: string,
    value: string,
    options?: CookieOptions,
  ) {
    const isProduction =
      this.config.get(EnvironmentVariables.NODE_ENV) === 'production';
    const opts: CookieOptions = {
      ...options,
      httpOnly: true,
      secure: isProduction,
      path: '/',
      sameSite: 'lax',
    };
    this.logger.debug('attaching cookie', { name, value, opts });
    return response.cookie(name, value, opts);
  }
}
