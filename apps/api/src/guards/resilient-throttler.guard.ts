import { ExecutionContext, Injectable, Logger } from '@nestjs/common';
import { ThrottlerGuard } from '@nestjs/throttler';

@Injectable()
export class ResilientThrottlerGuard extends ThrottlerGuard {
  private readonly logger = new Logger(ResilientThrottlerGuard.name);

  override async canActivate(context: ExecutionContext): Promise<boolean> {
    try {
      return await super.canActivate(context);
    } catch (error: unknown) {
      const message = error instanceof Error ? error.message : String(error);
      if (message.includes('max requests limit exceeded')) {
        this.logger.warn('Throttler storage unavailable, allowing request', {
          error: message,
        });
        return true;
      }
      throw error;
    }
  }
}
