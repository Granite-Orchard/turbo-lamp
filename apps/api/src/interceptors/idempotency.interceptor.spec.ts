import { IdempotencyInterceptor } from './idempotency.interceptor';

describe('IdempotencyInterceptor', () => {
  let interceptor: IdempotencyInterceptor;

  beforeEach(() => {
    interceptor = new IdempotencyInterceptor({} as any);
  });

  it('should be defined', () => {
    expect(interceptor).toBeDefined();
  });
});