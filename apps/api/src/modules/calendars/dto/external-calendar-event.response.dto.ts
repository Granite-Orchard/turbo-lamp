import { Exclude, Expose, Type } from 'class-transformer';

@Exclude()
export class CalendarEventTimeResponseDto {
  @Expose()
  dateTime: string;
  @Expose()
  timeZone?: string;
}

@Exclude()
export class ExternalCalendarEventResponseDto {
  @Expose()
  id?: string;
  @Expose()
  summary?: string;
  @Expose()
  description?: string;
  @Expose()
  location?: string;
  @Expose()
  @Type(() => CalendarEventTimeResponseDto)
  start: CalendarEventTimeResponseDto;
  @Expose()
  @Type(() => CalendarEventTimeResponseDto)
  end: CalendarEventTimeResponseDto;
}
