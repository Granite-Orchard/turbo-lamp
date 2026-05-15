import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { LoginDto } from './login.dto';

describe('LoginDto', () => {
  it('should validate valid credentials', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'test@example.com',
      password: 'SecurePass123!',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid email', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'not-email',
      password: 'SecurePass123!',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject weak password', async () => {
    const dto = plainToInstance(LoginDto, {
      username: 'test@example.com',
      password: 'weak',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
