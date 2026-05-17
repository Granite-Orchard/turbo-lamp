import { ApiProperty } from '@nestjs/swagger';
import { IsEmail, IsUUID } from 'class-validator';

export class CreateMeetingAttendeeDto {
  @ApiProperty({ description: 'The ID of the attendee.' })
  @IsUUID()
  userId: string;

  @ApiProperty({ description: 'The ID of the meeting.' })
  @IsUUID()
  meetingId: string;

  @ApiProperty({ description: 'The email address of the attendee.' })
  @IsEmail()
  email: string;
}
