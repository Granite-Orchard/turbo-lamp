import { ApiProperty } from '@nestjs/swagger';
import {
  IsEmail,
  IsStrongPassword,
  Validate,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  ValidationArguments,
  IsOptional,
  IsTimeZone,
} from 'class-validator';

interface RegisterDtoPayload {
  password: string;
}

@ValidatorConstraint({ name: 'passwordsMatch', async: false })
class PasswordsMatchConstraint implements ValidatorConstraintInterface {
  validate(confirmPassword: string, args: ValidationArguments) {
    const obj = args.object as RegisterDtoPayload;
    return obj.password === confirmPassword;
  }

  defaultMessage() {
    return 'Password and confirm password must match';
  }
}

export class RegisterDto {
  @ApiProperty({ description: 'The users email address.' })
  @IsEmail()
  username: string;

  @ApiProperty({ description: 'The users password.' })
  @IsStrongPassword()
  password: string;

  @ApiProperty({ description: 'The users password confirmation.' })
  @IsStrongPassword()
  @Validate(PasswordsMatchConstraint)
  confirmPassword: string;

  @ApiProperty({ description: 'The time zone of the users profile.' })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
