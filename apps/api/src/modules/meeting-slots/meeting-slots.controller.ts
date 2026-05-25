import {
  Controller,
  Get,
  Inject,
  Logger,
  Param,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Account } from '../accounts/entities/account.entity';
import { MeetingSlotsService } from './meeting-slots.service';
import { MeetingsService } from '../meetings/meetings.service';
import { MeetingSlotResponseDto } from './dto/meeting-slot.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meeting-slots', version: '1' })
export class MeetingSlotsController {
  private readonly logger: Logger = new Logger(MeetingSlotsController.name);
  constructor(
    @Inject(MeetingSlotsService)
    private readonly meetingSlotsService: MeetingSlotsService,
    @Inject(MeetingsService)
    private readonly meetingService: MeetingsService,
  ) {}

  @Get(':meetingGroupId')
  async findSlots(
    @Req() req: Request & { user: Account },
    @Param('meetingGroupId') meetingGroupId: string,
  ): Promise<MeetingSlotResponseDto[]> {
    this.logger.debug('findSlots invoked', {
      correlationId: '623f03a9-54bb-4d82-b644-9c777f8c1a32',
      userId: req.user.userId,
      meetingGroupId,
    });
    const results = await this.meetingSlotsService.findAllBy([
      {
        meetingGroup: {
          id: meetingGroupId,
          authorId: req.user.userId,
        },
      },
    ]);
    return results.map((result) =>
      plainToInstance(MeetingSlotResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':meetingGroupId/calculate')
  async calculate(
    @Req() req: Request & { user: Account },
    @Param('meetingGroupId') meetingGroupId: string,
  ): Promise<MeetingSlotResponseDto[]> {
    this.logger.debug('calculate invoked', {
      correlationId: '3f2d2c3a-ae46-4772-8d8c-f6f346cedd48',
      userId: req.user.userId,
      meetingGroupId,
    });
    const meetingExists = await this.meetingService.findOneBy({
      meetingGroupId,
    });
    if (meetingExists) {
      return await this.meetingSlotsService.findAllBy([
        {
          meetingGroup: {
            id: meetingGroupId,
            authorId: req.user.userId,
          },
        },
      ]);
    }
    const results = await this.meetingSlotsService.calculate(
      meetingGroupId,
      req.user.userId,
    );
    return results.map((result) =>
      plainToInstance(MeetingSlotResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }
}
