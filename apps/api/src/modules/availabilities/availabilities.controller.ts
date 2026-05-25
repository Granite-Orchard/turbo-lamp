import {
  Body,
  Controller,
  Delete,
  Get,
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
import { AvailabilitiesService } from './availabilities.service';
import { CreateAvailabilityDto } from './dto/create-availability.dto';
import { UpdateAvailabilityDto } from './dto/update-availability.dto';
import { AvailabilityResponseDto } from './dto/availability.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'availabilities', version: '1' })
export class AvailabilitiesController {
  private readonly logger = new Logger(AvailabilitiesController.name);
  constructor(private readonly availabilitiesService: AvailabilitiesService) {}

  @Post('upsert/batch')
  async upsertBatch(
    @Req() req: Request & { user: Account },
    @Body() createAvailabilityDto: CreateAvailabilityDto[] & { userId: string },
  ): Promise<AvailabilityResponseDto[]> {
    this.logger.debug('upsertBatch invoked', {
      correlationId: '0c825ef2-0aa4-4de5-b6f8-3faa69db1c3f',
      userId: req.user.userId,
    });
    const promises = createAvailabilityDto.map((dto) => {
      return this.availabilitiesService.upsert({
        ...dto,
        userId: req.user.userId,
        createdBy: req.user.userId,
      });
    });
    const results = await Promise.all(promises);
    return results.map((result) => {
      return plainToInstance(AvailabilityResponseDto, result, {
        excludeExtraneousValues: true,
      });
    });
  }

  @Post('upsert')
  async upsert(
    @Req() req: Request & { user: Account },
    @Body() createAvailabilityDto: CreateAvailabilityDto & { userId: string },
  ): Promise<AvailabilityResponseDto> {
    this.logger.debug('upsert invoked', {
      correlationId: '6ccb9e9b-73df-4144-9d02-a30852ab218d',
      userId: req.user.userId,
    });
    const result = await this.availabilitiesService.upsert({
      ...createAvailabilityDto,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });

    return plainToInstance(AvailabilityResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createAvailabilityDto: CreateAvailabilityDto & { userId: string },
  ): Promise<AvailabilityResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: 'c45f4fc7-001c-4806-8ed1-2abd1473b435',
      userId: req.user.userId,
    });
    const result = await this.availabilitiesService.create({
      ...createAvailabilityDto,
      userId: req.user.userId,
      createdBy: req.user.userId,
    });

    return plainToInstance(AvailabilityResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<AvailabilityResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: 'f58bc72d-6f3e-4bf1-9839-cb17b9688e07',
      userId: req.user.userId,
    });
    const results = await this.availabilitiesService.findAllBy({
      userId: req.user.userId,
    });
    return results.map((result) =>
      plainToInstance(AvailabilityResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AvailabilityResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: '1eaa724d-8c3b-4e94-bb4d-fece4b36fcf4',
      userId: req.user.userId,
    });
    const result = await this.availabilitiesService.findOneBy({
      id,
      userId: req.user.userId,
    });

    return plainToInstance(AvailabilityResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateAvailabilityDto: UpdateAvailabilityDto,
  ): Promise<AvailabilityResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '8ef3b66e-aae0-4a68-bc84-a6f52201a58c',
      userId: req.user.userId,
    });
    const existing = await this.availabilitiesService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const result = await this.availabilitiesService.update(
      id,
      updateAvailabilityDto,
    );

    return plainToInstance(AvailabilityResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AvailabilityResponseDto> {
    this.logger.debug('remove invoked', {
      correlationId: '9086e713-9913-4ad8-9488-ed621a64e838',
      userId: req.user.userId,
    });
    const existing = await this.availabilitiesService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const result = await this.availabilitiesService.remove(id);

    return plainToInstance(AvailabilityResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
