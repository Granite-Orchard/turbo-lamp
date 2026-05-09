import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsNumber,
  IsOptional,
  IsString,
  IsTimeZone,
  IsUUID,
} from 'class-validator';
import { MeetingGroupStatus } from '../../../libs/constants';

export class CreateMeetingGroupDto {
  @IsOptional()
  @IsUUID()
  authorId?: string;

  @ApiProperty({ description: 'The ID of the authors calendar.' })
  @IsUUID()
  calendarId: string;

  @ApiProperty({ description: 'The summary of the meeting group.' })
  @IsString()
  summary: string;

  @ApiProperty({ description: 'The description of the meeting group.' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ description: 'The magic link of the meeting group.' })
  @IsOptional()
  @IsString()
  magicLink?: string;

  @ApiProperty({ description: 'The location of the meeting group.' })
  @IsOptional()
  @IsString()
  location?: string;

  @ApiProperty({
    description: 'The duration (in minutes) of the meeting group.',
  })
  @IsNumber()
  duration: number;

  @ApiProperty({
    description: 'The after date of the meeting group.',
    default: new Date().toISOString(),
  })
  @IsDateString()
  after: Date;

  @ApiProperty({
    description: 'The before date of the meeting group.',
    default: new Date().toISOString(),
  })
  @IsDateString()
  before: Date;

  @ApiProperty({
    description: 'The timezone of the meeting group.',
    default: 'America/Halifax',
  })
  @IsOptional()
  @IsTimeZone()
  timezone?: string;

  @ApiProperty({
    description: 'The status of the meeting group.',
    enum: MeetingGroupStatus,
    enumName: 'MeetingGroupStatus',
  })
  @IsEnum(MeetingGroupStatus)
  status: MeetingGroupStatus;
}
