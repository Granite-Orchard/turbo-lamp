import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
  InternalServerErrorException,
  Logger,
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
  private readonly logger: Logger = new Logger(
    MeetingParticipantsController.name,
  );
  constructor(
    @Inject(MeetingParticipantsService)
    private readonly meetingParticipantsService: MeetingParticipantsService,
  ) {}

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingParticipantDto: CreateMeetingParticipantDto,
  ): Promise<MeetingParticipantResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: '6c788565-93ea-4834-80fc-3aebcea63df4',
      userId: req.user.userId,
      createMeetingParticipantDto,
    });
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
    this.logger.debug('findAll invoked', {
      correlationId: '322f3006-736e-48e5-a1e3-63731ef1c9d7',
      userId: req.user.userId,
      meetingGroupId,
    });
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
    this.logger.debug('findOne invoked', {
      correlationId: '24a97b49-55f7-4cc2-b1d9-bd80e2cab6fc',
      userId: req.user.userId,
      id,
    });
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
    this.logger.debug('update invoked', {
      correlationId: '24a97b49-55f7-4cc2-b1d9-bd80e2cab6fc',
      userId: req.user.userId,
      id,
      updateMeetingParticipantDto,
    });
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
    this.logger.debug('remove invoked', {
      correlationId: '085c536d-6fba-4203-a757-dcad2aba1810',
      userId: req.user.userId,
      id,
    });
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
