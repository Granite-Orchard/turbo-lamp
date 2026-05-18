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
