import {
  BadRequestException,
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
  Res,
  UseGuards,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import { plainToInstance } from 'class-transformer';
import express from 'express';
import { DataSource, Equal } from 'typeorm';
import { NIL } from 'uuid';
import { JwtAuthGuard } from '../../guards/jwt-auth.guard';
import {
  EnvironmentVariables,
  ParticipantAuthState,
  ParticipantInvitationState,
  SanitizedRoutes,
  VerificationType,
  VerificationValue,
} from '../../libs/constants';
import { convertDateToTimezone } from '../../utils/helpers/datetimes';
import { Account } from '../accounts/entities/account.entity';
import { TokenService } from '../auth/token.service';
import { MeetingParticipant } from '../meeting-participants/entities/meeting-participant.entity';
import { Verification } from '../verifications/entities/verification.entity';
import { VerificationsService } from '../verifications/verifications.service';
import { CreateMeetingGroupDto } from './dto/create-meeting-group.dto';
import { MeetingGroupResponseDto } from './dto/meeting-group.response.dto';
import { UpdateMeetingGroupDto } from './dto/update-meeting-group.dto';
import { MeetingGroup } from './entities/meeting-group.entity';
import { MeetingGroupsService } from './meeting-groups.service';

@ApiBearerAuth()
@Controller({ path: 'meeting-groups', version: '1' })
export class MeetingGroupsController {
  private readonly logger = new Logger(MeetingGroupsController.name);
  constructor(
    private readonly dataSource: DataSource,
    @Inject(MeetingGroupsService)
    private readonly meetingGroupsService: MeetingGroupsService,
    @Inject(VerificationsService)
    private readonly verificationService: VerificationsService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
  ) {}

  @UseGuards(JwtAuthGuard)
  @Post()
  async create(
    @Req() req: Request & { user: Account },
    @Body() createMeetingGroupDto: CreateMeetingGroupDto,
  ): Promise<MeetingGroupResponseDto> {
    this.logger.debug('create invoked', {
      correlationId: '03055c45-0f94-49f7-a5c8-55a1e8d8254b',
      userId: req.user.userId,
      createMeetingGroupDto,
    });
    const sanitizedAfter = new Date(createMeetingGroupDto.after);
    const sanitizedBefore = new Date(createMeetingGroupDto.before);
    const timezonedAfter = convertDateToTimezone(
      sanitizedAfter,
      createMeetingGroupDto.timezone!,
    );
    const timezonedBefore = convertDateToTimezone(
      sanitizedBefore,
      createMeetingGroupDto.timezone!,
    );

    const meetingGroupInput = {
      ...createMeetingGroupDto,
      after: timezonedAfter,
      before: timezonedBefore,
      authorId: req.user.userId,
      createdBy: req.user.userId,
    };

    const result = await this.dataSource.transaction(async (manager) => {
      const meetingGroupsRepo = manager.getRepository(MeetingGroup);
      const meetingParticipantsRepo = manager.getRepository(MeetingParticipant);

      this.meetingGroupsService.validateMeetingGroupConstraints(
        meetingGroupInput,
      );
      const group = await meetingGroupsRepo.save(meetingGroupInput);

      const magicLink = await this.meetingGroupsService.generateMagicLink(
        group.id,
      );
      await meetingGroupsRepo.update(group.id, { magicLink });
      await meetingParticipantsRepo.save({
        createdBy: req.user.userId,
        meetingGroupId: group.id,
        email: req.user.user.email,
        userId: req.user.userId,
        required: true,
        authState: ParticipantAuthState.AUTHORIZED,
        invitationState: ParticipantInvitationState.ACCEPTED,
      });
      return group;
    });

    return plainToInstance(MeetingGroupResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<MeetingGroupResponseDto[]> {
    this.logger.debug('findAll invoked', {
      correlationId: 'e6bee973-79c5-4a23-9be8-a5835de6461b',
      userId: req.user.userId,
    });
    const results = await this.meetingGroupsService.findAllBy(
      { authorId: Equal(req.user.userId) },
      {
        participants: { user: true },
      },
    );

    return results.map((result) =>
      plainToInstance(MeetingGroupResponseDto, result, {
        excludeExtraneousValues: true,
      }),
    );
  }

  @Get(':id/accept')
  async accept(
    @Req() req: Request,
    @Param('id') id: string,
    @Query('token') token: string,
    @Res() res: express.Response,
  ) {
    this.logger.debug('accept invoked', {
      correlationId: '09ab0f5d-f65e-470b-9318-7981c296f9ca',
      id,
      token,
    });
    const verification = await this.verificationService.findOneBy({
      identifier: token,
    });
    if (!verification) {
      throw new BadRequestException();
    }
    if (new Date() >= verification.expiresAt) {
      throw new BadRequestException();
    }
    const value: VerificationValue = await this.tokenService.verify(
      verification.value,
    );
    if (value.type !== VerificationType.MAGIC_LINK_INVITATION) {
      throw new BadRequestException();
    }
    if (id !== value.id) {
      this.logger.error('meeting group id does not match verification', {
        id,
        value,
      });
      throw new BadRequestException();
    }

    const result = await this.dataSource.transaction(async (manager) => {
      const meetingParticipantsRepo = manager.getRepository(MeetingParticipant);
      const verificationRepo = manager.getRepository(Verification);

      const participant = await meetingParticipantsRepo.save({
        createdBy: NIL,
        meetingGroupId: id,
        required: false,
        email: `${this.tokenService.randomHash()}@anonymous.com`,
        authState: ParticipantAuthState.UNAUTHORIZED,
        invitationState: ParticipantInvitationState.PENDING,
      });

      const newValue: VerificationValue = {
        type: VerificationType.MAGIC_LINK_INVITATION,
        id: participant.id,
        to: '',
        after: SanitizedRoutes.MEETING_INVITATION_ACCEPTED,
      };
      // 5 minutes
      const expiresIn = 300000;
      const expiresAt = new Date(Date.now() + expiresIn);
      const newVerification = await verificationRepo.save({
        identifier: this.tokenService.randomHash(),
        value: this.tokenService.sign(newValue, { expiresIn }),
        expiresAt,
      });
      return newVerification;
    });
    const frontendUrl = this.configService.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;
    res.redirect(
      `${frontendUrl}/${value.after}?token=${encodeURIComponent(result.identifier)}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingGroupResponseDto> {
    this.logger.debug('findOne invoked', {
      correlationId: '80f52994-f6c9-479b-8dad-af4b999038ef',
      id,
      userId: req.user.userId,
    });
    const result = await this.meetingGroupsService.findOneBy(
      { id },
      {
        participants: { user: true },
      },
    );

    return plainToInstance(MeetingGroupResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Patch(':id')
  async update(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
    @Body() updateMeetingGroupDto: UpdateMeetingGroupDto,
  ): Promise<MeetingGroupResponseDto> {
    this.logger.debug('update invoked', {
      correlationId: '42518899-f2c3-4e94-b9e2-3b9381d1ccb0',
      id,
      userId: req.user.userId,
      updateMeetingGroupDto,
    });
    const found = await this.meetingGroupsService.findOneBy([
      { id, authorId: Equal(req.user.userId) },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.meetingGroupsService.update(
      id,
      updateMeetingGroupDto,
    );

    return plainToInstance(MeetingGroupResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Delete(':id')
  async remove(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingGroupResponseDto> {
    this.logger.debug('remove invoked', {
      correlationId: 'b593bebe-9e81-4808-8ece-f484d0af2dd6',
      id,
      userId: req.user.userId,
    });
    const found = await this.meetingGroupsService.findOneBy([
      { id, authorId: Equal(req.user.userId) },
    ]);
    if (!found) {
      throw new NotFoundException();
    }
    const result = await this.meetingGroupsService.remove(id);
    if (!result.affected) {
      throw new InternalServerErrorException();
    }

    return plainToInstance(MeetingGroupResponseDto, found, {
      excludeExtraneousValues: true,
    });
  }
}
