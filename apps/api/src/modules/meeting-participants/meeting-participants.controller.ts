import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  NotFoundException,
  Param,
  Patch,
  Post,
  Req,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { Account } from '../accounts/entities/account.entity';
import { CreateMeetingParticipantDto } from './dto/create-meeting-participant.dto';
import { UpdateMeetingParticipantDto } from './dto/update-meeting-participant.dto';
import { MeetingParticipantsService } from './meeting-participants.service';
import { MeetingParticipantResponseDto } from './dto/meeting-participant.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meeting-participants', version: '1' })
export class MeetingParticipantsController {
  constructor(
    @Inject(MeetingParticipantsService)
    private readonly meetingParticipantsService: MeetingParticipantsService,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingParticipantDto: CreateMeetingParticipantDto,
  ): Promise<MeetingParticipantResponseDto> {
    const result = await this.meetingParticipantsService.create({
      ...createMeetingParticipantDto,
      createdBy: req.user.userId,
    });
    return plainToInstance(MeetingParticipantResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get('/meeting-group/:id')
  async findAll(
    @Req() req: Request & { user: Account },
    @Param('id') meetingGroupId: string,
  ): Promise<MeetingParticipantResponseDto[]> {
    const results = await this.meetingParticipantsService.findAllBy([
      { meetingGroupId },
    ]);

    return results.map((result) =>
      plainToInstance(MeetingParticipantResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingParticipantResponseDto> {
    const result = await this.meetingParticipantsService.findOneBy([
      { id, userId: req.user.userId },
      { id, email: req.user.user.email },
      { id, createdBy: req.user.userId },
    ]);

    return plainToInstance(MeetingParticipantResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateMeetingParticipantDto: UpdateMeetingParticipantDto,
  ): Promise<MeetingParticipantResponseDto> {
    const found = await this.meetingParticipantsService.findOneBy([
      { id, userId: req.user.userId },
      { id, email: req.user.user.email },
      { id, createdBy: req.user.userId },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.meetingParticipantsService.update(
      id,
      updateMeetingParticipantDto,
    );
    return plainToInstance(MeetingParticipantResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingParticipantResponseDto> {
    const found = await this.meetingParticipantsService.findOneBy([
      { id, userId: req.user.userId },
      { id, email: req.user.user.email },
      { id, createdBy: req.user.userId },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.meetingParticipantsService.remove(id);
    if (!result.affected) {
      throw new InternalServerErrorException();
    }

    return plainToInstance(MeetingParticipantResponseDto, found, {
      excludeExtraneousValues: true,
    });
  }
}
