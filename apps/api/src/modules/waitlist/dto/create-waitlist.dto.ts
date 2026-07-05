import { ApiProperty } from '@nestjs/swagger';
import { IsEmail } from 'class-validator';

export class CreateWaitlistDto {
  @ApiProperty({ description: 'The email address of the user.' })
  @IsEmail()
  email: string;
}
