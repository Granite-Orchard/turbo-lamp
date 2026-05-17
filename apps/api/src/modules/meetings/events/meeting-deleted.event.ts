import { IEvent } from '@nestjs/cqrs';
import { Meeting } from '../entities/meeting.entity';

export class MeetingDeletedEvent implements IEvent {
  constructor(public readonly entity: Meeting) {}
}
