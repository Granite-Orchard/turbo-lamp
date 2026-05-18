import {
  Body,
  Controller,
  Delete,
  Get,
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
import { CreateMeetingAttendeeDto } from './dto/create-meeting-attendee.dto';
import { UpdateMeetingAttendeeDto } from './dto/update-meeting-attendee.dto';
import { MeetingAttendeesService } from './meeting-attendees.service';
import { MeetingAttendeeResponseDto } from './dto/meeting-attendee.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meeting-attendees', version: '1' })
export class MeetingAttendeesController {
  constructor(private readonly attendeeService: MeetingAttendeesService) {}

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingAttendeeDto: CreateMeetingAttendeeDto,
  ): Promise<MeetingAttendeeResponseDto> {
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
