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
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';
import { Account } from '../accounts/entities/account.entity';
import { CreateMeetingDto } from './dto/create-meeting.dto';
import { UpdateMeetingDto } from './dto/update-meeting.dto';
import { MeetingsService } from './meetings.service';
import { MeetingResponseDto } from './dto/meeting.response.dto';
import { plainToInstance } from 'class-transformer';
import { Equal } from 'typeorm';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'meetings', version: '1' })
export class MeetingsController {
  constructor(
    @Inject(MeetingsService)
    private readonly meetingsService: MeetingsService,
  ) {}

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<MeetingResponseDto[]> {
    const results = await this.meetingsService.findAllBy({
      meetingGroup: { participants: { userId: req.user.userId } },
    });
    return results.map((result) =>
      plainToInstance(MeetingResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.findOneBy(
      {
        id,
        attendees: { userId: Equal(req.user.userId) },
      },
      {
        attendees: true,
        meetingGroup: true,
      },
    );
    if (!result) {
      throw new NotFoundException();
    }
    return plainToInstance(MeetingResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  @UseInterceptors(IdempotencyInterceptor)
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingDto: CreateMeetingDto,
  ): Promise<MeetingResponseDto> {
    const result = await this.meetingsService.create(createMeetingDto);
    return plainToInstance(MeetingResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateMeetingDto: UpdateMeetingDto,
  ): Promise<MeetingResponseDto> {
    const found = await this.meetingsService.findOneBy({
      id,
      meetingGroup: { authorId: req.user.userId },
    });
    if (!found) throw new NotFoundException();
    const result = await this.meetingsService.update(id, updateMeetingDto);
    return plainToInstance(MeetingResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingResponseDto> {
    const found = await this.meetingsService.findOneBy({
      id,
      meetingGroup: { authorId: req.user.userId },
    });
    if (!found) throw new NotFoundException();
    const result = await this.meetingsService.remove(id);
    if (!result.affected) {
      throw new InternalServerErrorException();
    }
    return plainToInstance(MeetingResponseDto, found, {
      excludeExtraneousValues: true,
    });
  }
}
