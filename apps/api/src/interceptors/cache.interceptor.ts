import { CacheInterceptor } from '@nestjs/cache-manager';
import { ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { Account } from '../modules/accounts/entities/account.entity';

@Injectable()
export class UseCacheInterceptor extends CacheInterceptor {
  trackBy(context: ExecutionContext): string {
    const request: Request & { user?: Account } = context
      .switchToHttp()
      .getRequest();

    const userId = request.user?.id;
    const url = request.url;

    if (!userId) return url;

    return `${userId}:${request.method}:${url}:${JSON.stringify(request.query)}:${JSON.stringify(request.params)}:${JSON.stringify(request.body)}`;
  }
}
