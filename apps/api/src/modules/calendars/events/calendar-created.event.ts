import { IEvent } from '@nestjs/cqrs';
import { Calendar } from '../entities/calendar.entity';

export class CalendarCreatedEvent implements IEvent {
  constructor(public readonly entity: Calendar) {}
}
