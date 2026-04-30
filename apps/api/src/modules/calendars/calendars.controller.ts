import {
  Body,
  Controller,
  Delete,
  Get,
  Inject,
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
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import { IdempotencyInterceptor } from '../../interceptors/idempotency.interceptor';
import { Account } from '../accounts/entities/account.entity';
import { CalendarsService } from './calendars.service';
import { CreateCalendarDto } from './dto/create-calendar.dto';
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
  async findAllExternal(@Req() req: Request & { user: Account }) {
    const { providerId } = req.user;
    return await this.externalCalendarService.listCalendars(
      providerId as 'google',
      {
        account: req.user,
      },
    );
  }

  @Get('external/:id/events')
  async events(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Query('after') after: Date,
    @Query('before') before: Date,
  ) {
    const calendar = await this.calendarService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!calendar) throw new NotFoundException();
    return await this.externalCalendarService.listEvents(
      req.user.providerId as 'google',
      {
        account: req.user,
        calendarId: calendar.externalId,
        timeMin: after.toString(),
        timeMax: before.toString(),
      },
    );
  }

  @Get()
  async findAll(@Req() req: Request & { user: Account }) {
    return await this.calendarService.findAllBy({ userId: req.user.userId });
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ) {
    const calendar = await this.calendarService.findOne(id);
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    return calendar;
  }

  @Post('upsert')
  @UseInterceptors(IdempotencyInterceptor)
  async upsert(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    return await this.calendarService.upsert({
      ...createCalendarDto,
      accountId: req.user.id,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });
  }

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto,
  ) {
    return await this.calendarService.create({
      ...createCalendarDto,
      accountId: req.user.id,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });
  }

  @Post('batch/upsert')
  async upsertBatch(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto[],
  ) {
    const promises = createCalendarDto.map((dto) =>
      this.calendarService.upsert({
        ...dto,
        accountId: req.user.id,
        userId: req.user.userId,
        createdBy: req.user.userId,
      }),
    );
    return await Promise.all(promises);
  }

  @Post('batch')
  async createBatch(
    @Req() req: Request & { user: Account },
    @Body() createCalendarDto: CreateCalendarDto[],
  ) {
    const promises = createCalendarDto.map((dto) =>
      this.calendarService.create({
        ...dto,
        accountId: req.user.id,
        userId: req.user.userId,
        createdBy: req.user.userId,
      }),
    );
    return await Promise.all(promises);
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateCalendarDto: UpdateCalendarDto,
  ) {
    const calendar = await this.calendarService.findOneBy({ id });
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    return await this.calendarService.update(id, {
      ...updateCalendarDto,
      userId: req.user.userId,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ) {
    const calendar = await this.calendarService.findOneBy({ id });
    if (!calendar) throw new NotFoundException();
    if (calendar.userId !== req.user.userId) throw new UnauthorizedException();
    return await this.calendarService.remove(id);
  }
}
