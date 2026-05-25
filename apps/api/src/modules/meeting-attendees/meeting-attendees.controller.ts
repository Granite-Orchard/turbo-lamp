import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateMeetingAttendeeDto } from './dto/create-meeting-attendee.dto';
import { UpdateMeetingAttendeeDto } from './dto/update-meeting-attendee.dto';
import { MeetingAttendeesService } from './meeting-attendees.service';
import { MeetingAttendeeResponseDto } from './dto/meeting-attendee.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meeting-attendees', version: '1' })
export class MeetingAttendeesController {
  private readonly logger: Logger = new Logger(MeetingAttendeesController.name);
  constructor(private readonly attendeeService: MeetingAttendeesService) {}

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingAttendeeDto: CreateMeetingAttendeeDto,
  ): Promise<MeetingAttendeeResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: '388875da-9a8c-4ff0-b14e-0c84ca91c111',
      userId: req.user.userId,
    });
    const result = await this.attendeeService.create({
      ...createMeetingAttendeeDto,
      createdBy: req.user.userId,
    });
    return plainToInstance(MeetingAttendeeResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<MeetingAttendeeResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: '45acf378-d093-46d3-80a7-c454d76514d5',
      userId: req.user.userId,
    });
    const results = await this.attendeeService.findAllBy([
      { createdBy: req.user.userId },
      { userId: req.user.userId },
    ]);

    return results.map((result) =>
      plainToInstance(MeetingAttendeeResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingAttendeeResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: '522ce147-c54b-4bba-9dfd-e326fb360baf',
      id,
      userId: req.user.userId,
    });
    const result = await this.attendeeService.findOneBy([
      { id, createdBy: req.user.userId },
      { id, userId: req.user.userId },
    ]);
    if (!result) {
      throw new NotFoundException();
    }
    return plainToInstance(MeetingAttendeeResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateMeetingAttendeeDto: UpdateMeetingAttendeeDto,
  ): Promise<MeetingAttendeeResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '9275b980-c6f6-4969-a8a9-92aa25e0f337',
      userId: req.user.userId,
      id,
      updateMeetingAttendeeDto,
    });
    const found = await this.attendeeService.findOneBy([
      { id, createdBy: req.user.userId },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.attendeeService.update(
      id,
      updateMeetingAttendeeDto,
    );

    return plainToInstance(MeetingAttendeeResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingAttendeeResponseDto> {
    this.logger.debug('remove invoked', {
      correlationId: 'd2584a35-9290-4626-afe7-d289531a4104',
      userId: req.user.userId,
      id,
    });
    const found = await this.attendeeService.findOneBy([
      { id, createdBy: req.user.userId },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.attendeeService.remove(id);
    if (!result.affected) {
      throw new InternalServerErrorException();
    }

    return plainToInstance(MeetingAttendeeResponseDto, found, {
      excludeExtraneousValues: true,
    });
  }
}
