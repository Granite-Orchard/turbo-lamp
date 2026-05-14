import { Controller, Get, Inject, Param, Req, UseGuards } from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Account } from '../accounts/entities/account.entity';
import { MeetingSlotsService } from './meeting-slots.service';
import { MeetingsService } from '../meetings/meetings.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meeting-slots', version: '1' })
export class MeetingSlotsController {
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
  ) {
    return await this.meetingSlotsService.findAllBy([
      {
        meetingGroup: {
          id: meetingGroupId,
          authorId: req.user.userId,
        },
      },
    ]);
  }

  @Get(':meetingGroupId/calculate')
  async calculate(
    @Req() req: Request & { user: Account },
    @Param('meetingGroupId') meetingGroupId: string,
  ) {
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
    return await this.meetingSlotsService.calculate(
      meetingGroupId,
      req.user.userId,
    );
  }
}
