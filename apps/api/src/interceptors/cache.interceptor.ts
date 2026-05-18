import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Account } from '../modules/accounts/entities/account.entity';
import { createHash } from 'crypto';

@Injectable()
export class UseCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string {
    const request: Request & { user?: Account } = context
      .switchToHttp()
      .getRequest();

    const userId = request.user?.id;

    if (!userId || request.method !== 'GET') return ''; // Only cache GET

    const queryHash = request.query
      ? createHash('sha256')
          .update(JSON.stringify(request.query))
          .digest('hex')
          .substring(0, 8)
      : '';

    // Use stable hash of body for POST/PUT with body
    const bodyHash = request.body
      ? createHash('sha256')
          .update(JSON.stringify(request.body))
          .digest('hex')
          .substring(0, 8)
      : '';

    return `${userId}:${request.method}:${request.path}:${queryHash}:${bodyHash}`;
  }
}
