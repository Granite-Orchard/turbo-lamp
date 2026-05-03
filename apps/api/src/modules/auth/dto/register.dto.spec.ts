import { RegisterDto } from './register.dto';
import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';

describe('RegisterDto', () => {
  it('should be defined', () => {
    expect(RegisterDto).toBeDefined();
  });
});