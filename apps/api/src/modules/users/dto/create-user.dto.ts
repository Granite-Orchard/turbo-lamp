import { ApiProperty } from '@nestjs/swagger';
import {
  IsBoolean,
  IsEmail,
  IsOptional,
  IsString,
  IsTimeZone,
} from 'class-validator';

export class CreateUserDto {
  @ApiProperty({ description: 'The given name of the user.' })
  @IsString()
  name: string;

  @ApiProperty({ description: 'The email address of the user.' })
  @IsEmail()
  email: string;

  @ApiProperty({ description: 'Is the email address has been verified.' })
  @IsBoolean()
  emailVerified: boolean;

  @ApiProperty({ description: 'The image url for the users profile.' })
  @IsOptional()
  @IsString()
  image?: string;

  @ApiProperty({ description: 'The time zone of the users profile.' })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;
}
