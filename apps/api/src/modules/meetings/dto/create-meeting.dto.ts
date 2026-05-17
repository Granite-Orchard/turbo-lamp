import { ApiProperty } from '@nestjs/swagger';
import {
  IsDateString,
  IsEnum,
  IsOptional,
  IsString,
  IsUUID,
} from 'class-validator';
import { MeetingStatus } from '../../../libs/constants';

export class CreateMeetingDto {
  @ApiProperty({ description: 'The ID of the meeting group.' })
  @IsUUID()
  meetingGroupId: string;

  @IsString()
  @IsOptional()
  externalEventId?: string;

  @ApiProperty({
    description: 'the meetings start time.',
    default: new Date().toISOString(),
  })
  @IsDateString()
  start: Date;

  @ApiProperty({
    description: 'the meetings end time.',
    default: new Date().toISOString(),
  })
  @IsDateString()
  end: Date;

  @ApiProperty({
    description: 'the meetings status.',
    enum: MeetingStatus,
    enumName: 'MeetingStatus',
  })
  @IsEnum(MeetingStatus)
  status: MeetingStatus;
}
