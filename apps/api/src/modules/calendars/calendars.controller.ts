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
  Query,
  Req,
  UnauthorizedException,
  UseGuards,
  UseInterceptors,
} from '@nestjs/common';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';
import { Account } from '../accounts/entities/account.entity';
import { CalendarsService } from './calendars.service';
import { CalendarResponseDto } from './dto/calendar.response.dto';
import { CreateCalendarDto } from './dto/create-calendar.dto';
import { ExternalCalendarEventResponseDto } from './dto/external-calendar-event.response.dto';
import { ExternalCalendarResponseDto } from './dto/external-calendar.response.dto';
import { UpdateCalendarDto } from './dto/update-calendar.dto';
import { ExternalCalendarService } from './external-calendar.service';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'calendars', version: '1' })
export class CalendarsController {
  private readonly logger: Logger = new Logger(CalendarsController.name);
  constructor(
    @Inject(CalendarsService)
    private readonly calendarService: CalendarsService,
    @Inject(ExternalCalendarService)
    private readonly externalCalendarService: ExternalCalendarService,
  ) {}

  @Get('external')
  async findAllExternal(
    @Req() req: Request & { user: Account },
  ): Promise<ExternalCalendarResponseDto[]> {
    this.logger.debug('findAllExternal invoked', {
      correlationId: 'c620ea07-b787-4d15-a350-c5e162f651dd',
      userId: req.user.userId,
    });
    const { providerId } = req.user;
    const results = await this.externalCalendarService.listCalendars(
      providerId as 'google',
      {
        account: req.user,
      },
    );
    return results.map((result) =>
      plainToInstance(ExternalCalendarResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get('external/:id/events')
  async events(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Query('after') after: string,
    @Query('before') before: string,
  ) {
    this.logger.debug('events invoked', {
      correlationId: '19c7944b-cba8-4422-a0e3-e635cd682e5a',
      id,
      before,
      after,
      userId: req.user.userId,
    });
    const calendar = await this.calendarService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!calendar) throw new NotFoundException();
    const results = await this.externalCalendarService.listEvents(
      req.user.providerId as 'google',
      {
        account: req.user,
        calendarId: calendar.externalId,
        timeMin: after.toString(),
        timeMax: before.toString(),
      },
    );
    return results.map((result) =>
      plainToInstance(ExternalCalendarEventResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<CalendarResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: 'db8aee1c-86b1-4edf-9854-e776862b5b5d',
      userId: req.user.userId,
    });
    const results = await this.calendarService.findAllBy({
      userId: req.user.userId,
    });

    return results.map((result) =>
      plainToInstance(CalendarResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<CalendarResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: '7b98a6b0-eed3-4a26-a66a-1d556b37cc0a',
      id,
      userId: req.user.userId,
    });
    const calendar = await this.calendarService.findOne(id);
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    return plainToInstance(CalendarResponseDto, calendar, {
      excludeExtraneousValues: true,
    });
  }

  @Post('upsert')
  @UseInterceptors(IdempotencyInterceptor)
  async upsert(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto,
  ): Promise<CalendarResponseDto> {
    this.logger.debug('upsert invoked', {
      correlationId: '531e2a70-5df6-4fb2-9f0d-f45c55089405',
      userId: req.user.userId,
      createCalendarDto,
    });
    const calendar = await this.calendarService.upsert({
      ...createCalendarDto,
      accountId: req.user.id,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });

    return plainToInstance(CalendarResponseDto, calendar, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto,
  ): Promise<CalendarResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: 'e9e705bc-e261-4098-8ad6-9bf0d96ac4cd',
      userId: req.user.userId,
      createCalendarDto,
    });
    const calendar = await this.calendarService.create({
      ...createCalendarDto,
      accountId: req.user.id,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });
    return plainToInstance(CalendarResponseDto, calendar, {
      excludeExtraneousValues: true,
    });
  }

  @Post('batch/upsert')
  async upsertBatch(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto[],
  ): Promise<CalendarResponseDto[]> {
    this.logger.debug('upsertBatch invoked', {
      correlationId: 'f825fa1c-ec5e-4cbe-868b-0e8a6192fbe6',
      userId: req.user.userId,
      createCalendarDto,
    });
    const promises = createCalendarDto.map((dto) =>
      this.calendarService.upsert({
        ...dto,
        accountId: req.user.id,
        userId: req.user.userId,
        createdBy: req.user.userId,
      }),
    );
    const results = await Promise.all(promises);
    return results.map((calendar) => {
      return plainToInstance(CalendarResponseDto, calendar, {
        excludeExtraneousValues: true,
      });
    });
  }

  @Post('batch')
  async createBatch(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto[],
  ): Promise<CalendarResponseDto[]> {
    this.logger.debug('createBatch invoked', {
      correlationId: '02f0af8d-813c-4b21-9cc8-55b225288637',
      userId: req.user.userId,
      createCalendarDto,
    });
    const promises = createCalendarDto.map((dto) =>
      this.calendarService.create({
        ...dto,
        accountId: req.user.id,
        userId: req.user.userId,
        createdBy: req.user.userId,
      }),
    );
    const results = await Promise.all(promises);

    return results.map((calendar) =>
      plainToInstance(CalendarResponseDto, calendar, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ): Promise<CalendarResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '474ceeb9-9dfd-4c92-aad7-e5f556d8d8da',
      userId: req.user.userId,
      id,
      updateCalendarDto,
    });
    const calendar = await this.calendarService.findOneBy({ id });
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    const result = await this.calendarService.update(id, {
      ...updateCalendarDto,
      userId: req.user.userId,
    });

    return plainToInstance(CalendarResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<CalendarResponseDto> {
    this.logger.debug('remove invoked', {
      correlationId: 'd9c3f499-d720-422f-9e39-f59abbbe0942',
      userId: req.user.userId,
      id,
    });
    const calendar = await this.calendarService.findOneBy({ id });
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    const result = await this.calendarService.remove(id);
    if (!result.affected) {
      throw new InternalServerErrorException();
    }

    return plainToInstance(CalendarResponseDto, calendar, {
      excludeExtraneousValues: true,
    });
  }
}
