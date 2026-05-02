import { Test, TestingModule } from '@nestjs/testing';
import { NotificationsService } from './notifications.service';
import { MAILER, type Mailer } from './mailer.interface';

describe('NotificationsService', () => {
  let service: NotificationsService;
  let mailer: Mailer;

  const mockMailer = {
    sendEmail: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        NotificationsService,
        { provide: MAILER, useValue: mockMailer },
      ],
    }).compile();

    service = module.get<NotificationsService>(NotificationsService);
    mailer = module.get<Mailer>(MAILER);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('sendEmail', () => {
    it('should call mailer sendEmail with params', async () => {
      const params = {
        from: 'test@example.com',
        to: 'recipient@example.com',
        subject: 'Test Subject',
        text: 'Test body',
      };

      mockMailer.sendEmail.mockResolvedValue(true);

      const result = await service.sendEmail(params);

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(params);
      expect(result).toBe(true);
    });

    it('should pass all email params to mailer', async () => {
      const params = {
        from: 'sender@example.com',
        to: 'receiver@example.com',
        cc: 'cc@example.com',
        bcc: 'bcc@example.com',
        subject: 'Email Subject',
        text: 'Email body',
        html: '<p>Email body</p>',
      };

      mockMailer.sendEmail.mockResolvedValue(true);

      await service.sendEmail(params);

      expect(mockMailer.sendEmail).toHaveBeenCalledWith(params);
    });
  });
});
