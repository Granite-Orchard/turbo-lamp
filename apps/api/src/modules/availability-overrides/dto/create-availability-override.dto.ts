import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean, IsString } from 'class-validator';

export class CreateAvailabilityOverrideDto {
  @ApiProperty({
    description: 'The date of the override.',
    default: new Date().toISOString().split('T')[0],
  })
  @IsString()
  date: string;

  @ApiProperty({
    description: 'The start time of the override.',
    default: new Date().toISOString().split('T')[1].split('.')[0],
  })
  @IsString()
  startTime: string;

  @ApiProperty({
    description: 'The end time of the override.',
    default: new Date().toISOString().split('T')[1].split('.')[0],
  })
  @IsString()
  endTime: string;

  @ApiProperty({
    description:
      'Whether the override represnet availability or unavailability.',
    default: false,
  })
  @IsBoolean()
  isAvailable: boolean;
}
