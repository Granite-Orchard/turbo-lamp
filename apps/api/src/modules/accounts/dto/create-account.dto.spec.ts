import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateAccountDto } from './create-account.dto';
import { AccountProvider } from '../../../libs/constants';

describe('CreateAccountDto', () => {
  it('should validate valid account data', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      accountId: 'acc-123',
      providerId: AccountProvider.GOOGLE,
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should accept optional tokens', async () => {
    const dto = plainToInstance(CreateAccountDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      accountId: 'acc-123',
      providerId: AccountProvider.GOOGLE,
      accessToken: 'token-123',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });
});
