import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateSessionDto } from './create-session.dto';

describe('CreateSessionDto', () => {
  it('should validate valid session data', async () => {
    const dto = plainToInstance(CreateSessionDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      token: 'token-123',
      expiresAt: '2025-01-01T00:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept optional fields', async () => {
    const dto = plainToInstance(CreateSessionDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      token: 'token-123',
      expiresAt: '2025-01-01T00:00:00.000Z',
      ipAddress: '127.0.0.1',
      userAgent: 'Mozilla/5.0',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid userId', async () => {
    const dto = plainToInstance(CreateSessionDto, {
      userId: 'not-uuid',
      token: 'token-123',
      expiresAt: '2025-01-01T00:00:00.000Z',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
