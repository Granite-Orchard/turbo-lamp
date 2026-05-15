import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilitiesService } from '../../availabilities/availabilities.service';
import { CalendarsService } from '../../calendars/calendars.service';
import { MeetingGroupsService } from '../../meeting-groups/meeting-groups.service';
import { MeetingParticipantAuthorizedEvent } from '../../meeting-participants/events/meeting-participant-authorized.event';
import { MeetingSlotsService } from '../meeting-slots.service';
import { MeetingParticipantAuthorizedHandler } from './meeting-participant-authorized.handler';
import { MeetingParticipant } from '../../meeting-participants/entities/meeting-participant.entity';

describe('MeetingParticipantAuthorizedHandler', () => {
  let handler: MeetingParticipantAuthorizedHandler;
  let mockMeetingGroupsService: jest.Mocked<MeetingGroupsService>;
  let mockMeetingSlotsService: jest.Mocked<MeetingSlotsService>;
  let mockAvailabilitiesService: jest.Mocked<AvailabilitiesService>;
  let mockCalendarsService: jest.Mocked<CalendarsService>;

  const mockMeetingGroup = {
    id: 'group-123',
    authorId: 'author-user-id',
  };

  const mockParticipant: Partial<MeetingParticipant> = {
    id: 'participant-123',
    userId: 'non-author-user-id',
    meetingGroupId: 'group-123',
  };

  beforeEach(async () => {
    mockMeetingGroupsService = {
      findOneBy: jest.fn(),
    } as unknown as jest.Mocked<MeetingGroupsService>;

    mockMeetingSlotsService = {
      calculate: jest.fn(),
    } as unknown as jest.Mocked<MeetingSlotsService>;

    mockAvailabilitiesService = {
      findAllBy: jest.fn(),
    } as unknown as jest.Mocked<AvailabilitiesService>;

    mockCalendarsService = {
      findAllBy: jest.fn(),
    } as unknown as jest.Mocked<CalendarsService>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        MeetingParticipantAuthorizedHandler,
        { provide: MeetingGroupsService, useValue: mockMeetingGroupsService },
        { provide: MeetingSlotsService, useValue: mockMeetingSlotsService },
        { provide: AvailabilitiesService, useValue: mockAvailabilitiesService },
        { provide: CalendarsService, useValue: mockCalendarsService },
      ],
    }).compile();

    handler = module.get<MeetingParticipantAuthorizedHandler>(
      MeetingParticipantAuthorizedHandler,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('handle', () => {
    it('should skip calculation when meeting group not found', async () => {
      mockMeetingGroupsService.findOneBy.mockResolvedValue(null);

      await handler.handle(
        new MeetingParticipantAuthorizedEvent(
          mockParticipant as MeetingParticipant,
        ),
      );

      expect(mockMeetingGroupsService.findOneBy).toHaveBeenCalledWith({
        id: 'group-123',
      });
      expect(mockMeetingSlotsService.calculate).not.toHaveBeenCalled();
    });

    it('should skip calculation when user is the author', async () => {
      mockMeetingGroupsService.findOneBy.mockResolvedValue(mockMeetingGroup);
      const authorParticipant = {
        ...mockParticipant,
        userId: 'author-user-id',
      };

      await handler.handle(
        new MeetingParticipantAuthorizedEvent(
          authorParticipant as MeetingParticipant,
        ),
      );

      expect(mockMeetingSlotsService.calculate).not.toHaveBeenCalled();
    });

    it('should skip calculation when user has no availabilities', async () => {
      mockMeetingGroupsService.findOneBy.mockResolvedValue(mockMeetingGroup);
      mockAvailabilitiesService.findAllBy.mockResolvedValue([]);

      await handler.handle(
        new MeetingParticipantAuthorizedEvent(
          mockParticipant as MeetingParticipant,
        ),
      );

      expect(mockAvailabilitiesService.findAllBy).toHaveBeenCalledWith({
        userId: 'non-author-user-id',
      });
      expect(mockMeetingSlotsService.calculate).not.toHaveBeenCalled();
    });

    it('should skip calculation when user has no enabled calendars', async () => {
      mockMeetingGroupsService.findOneBy.mockResolvedValue(mockMeetingGroup);
      mockAvailabilitiesService.findAllBy.mockResolvedValue([{}]);
      mockCalendarsService.findAllBy.mockResolvedValue([]);

      await handler.handle(
        new MeetingParticipantAuthorizedEvent(
          mockParticipant as MeetingParticipant,
        ),
      );

      expect(mockCalendarsService.findAllBy).toHaveBeenCalledWith({
        userId: 'non-author-user-id',
        enabled: true,
      });
      expect(mockMeetingSlotsService.calculate).not.toHaveBeenCalled();
    });

    it('should proceed with calculation when user has valid context', async () => {
      mockMeetingGroupsService.findOneBy.mockResolvedValue(mockMeetingGroup);
      mockAvailabilitiesService.findAllBy.mockResolvedValue([{}]);
      mockCalendarsService.findAllBy.mockResolvedValue([
        { externalId: 'abc123' },
      ]);

      await handler.handle(
        new MeetingParticipantAuthorizedEvent(
          mockParticipant as MeetingParticipant,
        ),
      );

      expect(mockMeetingSlotsService.calculate).toHaveBeenCalledWith(
        'group-123',
        'author-user-id',
      );
    });
  });
});
