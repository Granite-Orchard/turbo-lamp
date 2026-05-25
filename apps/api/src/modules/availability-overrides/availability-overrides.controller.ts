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
import { AvailabilityOverridesService } from './availability-overrides.service';
import { CreateAvailabilityOverrideDto } from './dto/create-availability-override.dto';
import { UpdateAvailabilityOverrideDto } from './dto/update-availability-override.dto';
import { AvailabilityOverrideResponseDto } from './dto/availability-override.response.dto';
import { plainToInstance } from 'class-transformer';

@ApiBearerAuth()
@UseGuards(JwtAuthGuard)
@Controller({ path: 'availability-overrides', version: '1' })
export class AvailabilityOverridesController {
  private readonly logger = new Logger(AvailabilityOverridesController.name);
  constructor(
    private readonly availabilityOverridesService: AvailabilityOverridesService,
  ) {}

  @Post('upsert')
  async upsert(
    @Req() req: Request & { user: Account },
    @Body() createAvailabilityOverrideDto: CreateAvailabilityOverrideDto,
  ): Promise<AvailabilityOverrideResponseDto> {
    this.logger.debug('upsert invoked', {
      correlationId: '8cf01efc-8e0e-429f-b84c-ead156db4a3f',
      userId: req.user.userId,
      createAvailabilityOverrideDto,
    });
    const result = await this.availabilityOverridesService.upsert({
      ...createAvailabilityOverrideDto,
      createdBy: req.user.userId,
      userId: req.user.userId,
    });

    return plainToInstance(AvailabilityOverrideResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createAvailabilityOverrideDto: CreateAvailabilityOverrideDto,
  ): Promise<AvailabilityOverrideResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: '8cf01efc-8e0e-429f-b84c-ead156db4a3f',
      userId: req.user.userId,
      createAvailabilityOverrideDto,
    });
    const result = await this.availabilityOverridesService.create({
      ...createAvailabilityOverrideDto,
      createdBy: req.user.userId,
      userId: req.user.userId,
    });

    return plainToInstance(AvailabilityOverrideResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<AvailabilityOverrideResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: '6a125921-bceb-43cf-9e6e-b255fb9df71d',
      userId: req.user.userId,
    });
    const results = await this.availabilityOverridesService.findAllBy({
      userId: req.user.userId,
    });

    return results.map((result) =>
      plainToInstance(AvailabilityOverrideResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AvailabilityOverrideResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: 'e44f0bb1-9c31-4ed2-882f-8ed79c0c3590',
      id,
      userId: req.user.userId,
    });
    const result = await this.availabilityOverridesService.findOneBy({
      id,
      userId: req.user.userId,
    });

    return plainToInstance(AvailabilityOverrideResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateAvailabilityOverrideDto: UpdateAvailabilityOverrideDto,
  ): Promise<AvailabilityOverrideResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '16b5b9c5-e83e-46df-b2ed-9ffe9f3c1d70',
      id,
      updateAvailabilityOverrideDto,
      userId: req.user.userId,
    });
    const existing = await this.availabilityOverridesService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const result = await this.availabilityOverridesService.update(
      id,
      updateAvailabilityOverrideDto,
    );

    return plainToInstance(AvailabilityOverrideResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<AvailabilityOverrideResponseDto> {
    this.logger.debug('remove invoked', {
      correlationId: 'b72e899d-f129-4e6d-8f95-7abeb5ffb30f',
      id,
      userId: req.user.userId,
    });
    const existing = await this.availabilityOverridesService.findOneBy({
      id,
      userId: req.user.userId,
    });
    if (!existing) {
      throw new NotFoundException();
    }
    const result = await this.availabilityOverridesService.remove(id);

    return plainToInstance(AvailabilityOverrideResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }
}
