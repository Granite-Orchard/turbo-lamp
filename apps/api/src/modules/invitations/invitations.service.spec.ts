import { Test, TestingModule } from '@nestjs/testing';
import { InvitationsService } from './invitations.service';
import { MeetingParticipantsService } from '../meeting-participants/meeting-participants.service';
import { Account } from '../accounts/entities/account.entity';
import {
  ParticipantAuthState,
  ParticipantInvitationState,
} from '../../libs/constants';

describe('InvitationsService', () => {
  let service: InvitationsService;
  let meetingParticipantsService: MeetingParticipantsService;

  const mockMeetingParticipantsService = {
    update: jest.fn(),
  };

  const mockUser = {
    user: {
      calendars: [{ id: 'calendar-1' }],
    },
  } as unknown as Account;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        InvitationsService,
        {
          provide: MeetingParticipantsService,
          useValue: mockMeetingParticipantsService,
        },
      ],
    }).compile();

    service = module.get<InvitationsService>(InvitationsService);
    meetingParticipantsService = module.get<MeetingParticipantsService>(
      MeetingParticipantsService,
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('acceptInvitation', () => {
    it('should accept invitation and set user as authorized', async () => {
      const invitationId = 'invitation-123';

      await service.acceptInvitation(invitationId, mockUser);

      expect(mockMeetingParticipantsService.update).toHaveBeenCalledWith(
        invitationId,
        {
          userId: mockUser.userId,
          invitationState: ParticipantInvitationState.ACCEPTED,
          authState: ParticipantAuthState.AUTHORIZED,
        },
      );
    });

    it('should accept invitation with no auth when user has no calendars', async () => {
      const invitationId = 'invitation-123';
      const userWithoutCalendars = {
        user: {
          calendars: [],
        },
      } as unknown as Account;

      await service.acceptInvitation(invitationId, userWithoutCalendars);

      expect(mockMeetingParticipantsService.update).toHaveBeenCalledWith(
        invitationId,
        {
          userId: mockUser.userId,
          invitationState: ParticipantInvitationState.ACCEPTED,
          authState: undefined,
        },
      );
    });
  });
});
