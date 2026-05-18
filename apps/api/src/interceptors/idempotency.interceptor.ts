import {
  BadRequestException,
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Observable, from, of } from 'rxjs';
import { switchMap, tap } from 'rxjs/operators';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Inject } from '@nestjs/common';
import { Cache } from '@nestjs/cache-manager';

import { Request } from 'express';

export const IDEMPOTENCY_KEY_HEADER = 'Idempotency-Key';
export const IDEMPOTENCY_TTL_SECONDS = 24 * 60 * 60; // 24 hours

@Injectable()
export class IdempotencyInterceptor implements NestInterceptor {
  constructor(
    @Inject(CACHE_MANAGER)
    private readonly cacheManager: Cache,
  ) {}

  intercept(context: ExecutionContext, next: CallHandler): Observable<unknown> {
    const request: Request & { user: { userId: string } } = context
      .switchToHttp()
      .getRequest();
    const idempotencyKey = request.headers[IDEMPOTENCY_KEY_HEADER] as string;

    if (!idempotencyKey) {
      return next.handle();
    }

    if (
      typeof idempotencyKey !== 'string' ||
      idempotencyKey.length < 16 ||
      idempotencyKey.length > 128 ||
      !/^[a-zA-Z0-9-]+$/.test(idempotencyKey)
    ) {
      throw new BadRequestException('Invalid idempotency key');
    }

    const userId = request.user?.userId ?? 'anonymous';
    const cacheKey = `idempotency:${userId}:${idempotencyKey}`;

    return from(this.cacheManager.get<string>(cacheKey)).pipe(
      switchMap((cached) => {
        if (cached) {
          return of(JSON.parse(cached));
        }

        return next.handle().pipe(
          tap((response) => {
            this.cacheManager
              .set(cacheKey, JSON.stringify(response), IDEMPOTENCY_TTL_SECONDS)
              .catch(() => {});
          }),
        );
      }),
    );
  }
}
