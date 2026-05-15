import { validate } from 'class-validator';
import { plainToInstance } from 'class-transformer';
import { CreateMeetingAttendeeDto } from './create-meeting-attendee.dto';

describe('CreateMeetingAttendeeDto', () => {
  it('should validate valid attendee data', async () => {
    const dto = plainToInstance(CreateMeetingAttendeeDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      meetingId: '123e4567-e89b-12d3-a456-426614174001',
      externalEventId: '123e4567-e89b-12d3-a456-426614174002',
      email: 'attendee@example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBe(0);
  });

  it('should reject invalid userId', async () => {
    const dto = plainToInstance(CreateMeetingAttendeeDto, {
      userId: 'invalid-uuid',
      meetingId: '123e4567-e89b-12d3-a456-426614174001',
      externalEventId: '123e4567-e89b-12d3-a456-426614174002',
      email: 'attendee@example.com',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });

  it('should reject invalid email', async () => {
    const dto = plainToInstance(CreateMeetingAttendeeDto, {
      userId: '123e4567-e89b-12d3-a456-426614174000',
      meetingId: '123e4567-e89b-12d3-a456-426614174001',
      externalEventId: '123e4567-e89b-12d3-a456-426614174002',
      email: 'not-email',
    });

    const errors = await validate(dto);
    expect(errors.length).toBeGreaterThan(0);
  });
});
