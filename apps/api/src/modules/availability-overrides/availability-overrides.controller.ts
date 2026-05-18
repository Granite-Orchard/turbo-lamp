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
