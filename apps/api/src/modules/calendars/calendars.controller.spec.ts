import { Test, TestingModule } from '@nestjs/testing';
import { CalendarsController } from './calendars.controller';
import { CalendarsService } from './calendars.service';
import { AccountsService } from '../accounts/accounts.service';
import { ExternalCalendarService } from './external-calendar.service';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';

describe('CalendarsController', () => {
  let controller: CalendarsController;

  const mockCalendarsService = {
    create: jest.fn().mockResolvedValue({ id: '1' }),
    findAll: jest.fn().mockResolvedValue([{ id: '1' }]),
  };

  const mockAccountsService = {
    findOneBy: jest.fn().mockResolvedValue({ id: '1' }),
  };

  const mockExternalCalendarService = {
    getCalendar: jest.fn().mockResolvedValue({}),
    deleteCalendar: jest.fn().mockResolvedValue({}),
    syncCalendar: jest.fn().mockResolvedValue({}),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [CalendarsController],
      providers: [
        { provide: CalendarsService, useValue: mockCalendarsService },
        { provide: AccountsService, useValue: mockAccountsService },
        { provide: ExternalCalendarService, useValue: mockExternalCalendarService },
      ],
    })
      .overrideInterceptor(IdempotencyInterceptor)
      .useValue({ intercept: jest.fn().mockReturnValue({}) })
      .compile();

    controller = module.get<CalendarsController>(CalendarsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});