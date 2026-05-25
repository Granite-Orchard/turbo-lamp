import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { Request } from 'express';
import { Account } from '../modules/accounts/entities/account.entity';
import { createHash } from 'crypto';

@Injectable()
export class UseCacheInterceptor extends CacheInterceptor {
  private readonly logger: Logger = new Logger(UseCacheInterceptor.name);
  trackBy(context: ExecutionContext): string {
    const request: Request & { user?: Account } = context
      .switchToHttp()
      .getRequest();

    this.logger.debug('trackBy invoked', {
      correlationId: '6b9665db-29ae-4ba6-98ee-ba70d244eabf',
      method: request.method,
    });

    if (request.method !== 'GET') return '';

    if (!request.user) return '';

    const userId = request.user.id;
    if (!userId) return '';

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

    this.logger.debug('Generated query and body hash', {
      correlationId: '6b9665db-29ae-4ba6-98ee-ba70d244eabf',
    });

    return `${userId}:${request.method}:${request.path}:${queryHash}:${bodyHash}`;
  }
}
