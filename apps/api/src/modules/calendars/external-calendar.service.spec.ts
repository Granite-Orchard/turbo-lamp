import { Test, TestingModule } from '@nestjs/testing';
import {
  ExternalCalendarService,
  CalendarProviderType,
} from './external-calendar.service';
import { GoogleCalendarProvider } from './providers/google-calendar.provider';

describe('ExternalCalendarService', () => {
  let service: ExternalCalendarService;
  let googleProvider: GoogleCalendarProvider;

  const mockGoogleProvider = {
    getTimezone: jest.fn(),
    listCalendars: jest.fn(),
    listEvents: jest.fn(),
    getEvent: jest.fn(),
    createEvent: jest.fn(),
    updateEvent: jest.fn(),
    deleteEvent: jest.fn(),
  };

  const mockAccount = {
    userId: '123e4567-e89b-12d3-a456-426614174001',
    user: {} as any,
  } as any;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ExternalCalendarService,
        { provide: GoogleCalendarProvider, useValue: mockGoogleProvider },
      ],
    }).compile();

    service = module.get<ExternalCalendarService>(ExternalCalendarService);
    googleProvider = module.get<GoogleCalendarProvider>(GoogleCalendarProvider);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('resolve', () => {
    it('should return google provider', () => {
      const provider = service.resolve('google');
      expect(provider).toBeDefined();
    });

    it('should throw error for unsupported provider', () => {
      expect(() => service.resolve('invalid' as CalendarProviderType)).toThrow(
        'Unsupported provider: invalid',
      );
    });
  });

  describe('getTimezone', () => {
    it('should call google provider getTimezone', async () => {
      const params = { account: mockAccount };
      mockGoogleProvider.getTimezone.mockResolvedValue('America/New_York');

      const result = await service.getTimezone('google', params);

      expect(mockGoogleProvider.getTimezone).toHaveBeenCalledWith(params);
      expect(result).toBe('America/New_York');
    });
  });

  describe('listCalendars', () => {
    it('should call google provider listCalendars', async () => {
      const params = { account: mockAccount };
      const mockCalendars = [{ calendarId: 'cal-1', name: 'Calendar' }];
      mockGoogleProvider.listCalendars.mockResolvedValue(mockCalendars);

      const result = await service.listCalendars('google', params);

      expect(mockGoogleProvider.listCalendars).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockCalendars);
    });
  });

  describe('listEvents', () => {
    it('should call google provider listEvents', async () => {
      const params = {
        account: mockAccount,
        timeMin: '2024-01-01T00:00:00Z',
        timeMax: '2024-12-31T23:59:59Z',
      };
      const mockEvents = [{ id: 'event-1', summary: 'Meeting' }];
      mockGoogleProvider.listEvents.mockResolvedValue(mockEvents);

      const result = await service.listEvents('google', params);

      expect(mockGoogleProvider.listEvents).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockEvents);
    });
  });

  describe('getEvent', () => {
    it('should call google provider getEvent', async () => {
      const params = {
        account: mockAccount,
        eventId: 'event-1',
      };
      const mockEvent = { id: 'event-1', summary: 'Meeting' };
      mockGoogleProvider.getEvent.mockResolvedValue(mockEvent);

      const result = await service.getEvent('google', params);

      expect(mockGoogleProvider.getEvent).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('createEvent', () => {
    it('should call google provider createEvent', async () => {
      const params = {
        account: mockAccount,
        event: { summary: 'New Meeting' },
      };
      const mockEvent = { id: 'event-1', summary: 'New Meeting' };
      mockGoogleProvider.createEvent.mockResolvedValue(mockEvent);

      const result = await service.createEvent('google', params);

      expect(mockGoogleProvider.createEvent).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('updateEvent', () => {
    it('should call google provider updateEvent', async () => {
      const params = {
        account: mockAccount,
        eventId: 'event-1',
        patch: { summary: 'Updated Meeting' },
      };
      const mockEvent = { id: 'event-1', summary: 'Updated Meeting' };
      mockGoogleProvider.updateEvent.mockResolvedValue(mockEvent);

      const result = await service.updateEvent('google', params);

      expect(mockGoogleProvider.updateEvent).toHaveBeenCalledWith(params);
      expect(result).toEqual(mockEvent);
    });
  });

  describe('deleteEvent', () => {
    it('should call google provider deleteEvent', async () => {
      const params = {
        account: mockAccount,
        eventId: 'event-1',
      };
      mockGoogleProvider.deleteEvent.mockResolvedValue({ success: true });

      const result = await service.deleteEvent('google', params);

      expect(mockGoogleProvider.deleteEvent).toHaveBeenCalledWith(params);
      expect(result).toEqual({ success: true });
    });
  });
});
