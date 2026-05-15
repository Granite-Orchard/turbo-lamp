import { Test, TestingModule } from '@nestjs/testing';
import { AvailabilityOverridesController } from './availability-overrides.controller';
import { AvailabilityOverridesService } from './availability-overrides.service';

describe('AvailabilityOverridesController', () => {
  let controller: AvailabilityOverridesController;

  const mockService = {
    create: jest.fn().mockResolvedValue({}),
    findAll: jest.fn().mockResolvedValue([]),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [AvailabilityOverridesController],
      providers: [
        { provide: AvailabilityOverridesService, useValue: mockService },
      ],
    }).compile();

    controller = module.get<AvailabilityOverridesController>(
      AvailabilityOverridesController,
    );
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
