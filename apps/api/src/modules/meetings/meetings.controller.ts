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
  private readonly logger: Logger = new Logger(MeetingsController.name);
  constructor(
    @Inject(MeetingsService)
    private readonly meetingsService: MeetingsService,
  ) {}

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<MeetingResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: 'e37cfacd-85e9-40c3-bddc-8e34af556280',
      userId: req.user.userId,
    });
    const results = await this.meetingsService.findAllBy({
      attendees: { userId: Equal(req.user.userId) },
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
    this.logger.debug('findOne invoked', {
      correlationId: '3db87d4b-b8a8-44eb-950e-48ac7a92c892',
      userId: req.user.userId,
      id,
    });
    const result = await this.meetingsService.findOneBy(
      {
        id,
        attendees: { userId: Equal(req.user.userId) },
      },
      {
        attendees: true,
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
    this.logger.debug('create invoked', {
      correlationId: 'ce9d16c9-b7ca-4002-8f20-3958df732b80',
      userId: req.user.userId,
      createMeetingDto,
    });
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
    this.logger.debug('update invoked', {
      correlationId: 'ab97bf5f-40bd-4e8b-86bb-d0d77ad01def',
      userId: req.user.userId,
      updateMeetingDto,
    });
    const found = await this.meetingsService.findOneBy({
      id,
      meetingGroup: { authorId: Equal(req.user.userId) },
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
    this.logger.debug('remove invoked', {
      correlationId: '329ceef6-1449-4886-ae84-8d81260f0434',
      userId: req.user.userId,
      id,
    });
    const found = await this.meetingsService.findOneBy({
      id,
      meetingGroup: { authorId: Equal(req.user.userId) },
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
