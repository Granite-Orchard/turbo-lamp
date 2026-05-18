import express from 'express';
import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { CookieOptions } from 'express';
import { EnvironmentVariables } from '../../libs/constants';

@Injectable()
export class CookieService {
  constructor(private readonly config: ConfigService) {}

  attachCookie(
    response: express.Response,
    name: string,
    value: string,
    options?: CookieOptions,
  ) {
    const isProduction =
      this.config.get(EnvironmentVariables.NODE_ENV) === 'production';
    const frontendUrl = this.config.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;
    const domain = isProduction ? new URL(frontendUrl).hostname : 'localhost';
    response.cookie(name, value, {
      ...options,
      httpOnly: true,
      sameSite: isProduction ? 'strict' : 'lax',
      secure: isProduction,
      domain,
      path: '/',
    });
  }
}
