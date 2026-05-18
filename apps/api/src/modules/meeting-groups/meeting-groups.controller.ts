import {
  BadRequestException,
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
  Query,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import { Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { ApiBearerAuth } from '@nestjs/swagger';
import express from 'express';
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
import { MeetingParticipantsService } from '../meeting-participants/meeting-participants.service';
import { VerificationsService } from '../verifications/verifications.service';
import { CreateMeetingGroupDto } from './dto/create-meeting-group.dto';
import { UpdateMeetingGroupDto } from './dto/update-meeting-group.dto';
import { MeetingGroupsService } from './meeting-groups.service';
import { MeetingGroupResponseDto } from './dto/meeting-group.response.dto';
import { plainToInstance } from 'class-transformer';
import { DataSource } from 'typeorm';
import { MeetingGroup } from './entities/meeting-group.entity';
import { MeetingParticipant } from '../meeting-participants/entities/meeting-participant.entity';

@ApiBearerAuth()
@Controller({ path: 'meeting-groups', version: '1' })
export class MeetingGroupsController {
  private readonly logger = new Logger(MeetingGroupsController.name);
  constructor(
    private readonly dataSource: DataSource,
    @Inject(MeetingGroupsService)
    private readonly meetingGroupsService: MeetingGroupsService,
    @Inject(MeetingParticipantsService)
    private readonly meetingParticipantService: MeetingParticipantsService,
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
    const calendar = req.user.calendars.find(
      (c) => c.id === createMeetingGroupDto.calendarId,
    );
    if (!calendar) {
      throw new BadRequestException();
    }
    const sanitizedAfter = new Date(createMeetingGroupDto.after);
    const sanitizedBefore = new Date(createMeetingGroupDto.before);
    const timezonedAfter = convertDateToTimezone(
      sanitizedAfter,
      calendar.timezone,
    );
    const timezonedBefore = convertDateToTimezone(
      sanitizedBefore,
      calendar.timezone,
    );

    const meetingGroupInput = {
      ...createMeetingGroupDto,
      after: timezonedAfter,
      before: timezonedBefore,
      timezone: calendar.timezone,
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
        meetingGroupId: result.id,
        email: req.user.user.email,
        userId: req.user.userId,
        required: true,
        authState: ParticipantAuthState.AUTHORIZED,
        invitationState: ParticipantInvitationState.ACCEPTED,
      });
      return group;
    });
    // const result = await this.meetingGroupsService.create({
    //   ...createMeetingGroupDto,
    //   after: timezonedAfter,
    //   before: timezonedBefore,
    //   timezone: calendar.timezone,
    //   authorId: req.user.userId,
    //   createdBy: req.user.userId,
    // });
    // const magicLink = await this.meetingGroupsService.generateMagicLink(
    //   result.id,
    // );
    // await this.meetingGroupsService.update(result.id, { magicLink });
    //
    // await this.meetingParticipantService.create({
    //   createdBy: req.user.userId,
    //   meetingGroupId: result.id,
    //   email: req.user.user.email,
    //   userId: req.user.userId,
    //   required: true,
    //   authState: ParticipantAuthState.AUTHORIZED,
    //   invitationState: ParticipantInvitationState.ACCEPTED,
    // });

    return plainToInstance(MeetingGroupResponseDto, result, {
      excludeExtraneousValues: true,
    });
  }

  @UseGuards(JwtAuthGuard)
  @Get()
  async findAll(
    @Req() req: Request & { user: Account },
  ): Promise<MeetingGroupResponseDto[]> {
    const results = await this.meetingGroupsService.findAllBy(
      [
        { authorId: req.user.userId },
        { participants: { userId: req.user.userId } },
      ],
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

    // TODO:... another transaction needed here
    const participant = await this.meetingParticipantService.create({
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
    const newVerification = await this.verificationService.create({
      identifier: this.tokenService.randomHash(),
      value: this.tokenService.sign(newValue, { expiresIn }),
      expiresAt,
    });
    const frontendUrl = this.configService.get<string>(
      EnvironmentVariables.FRONTEND_URL,
    )!;
    res.redirect(
      `${frontendUrl}/${value.after}?token=${encodeURIComponent(newVerification.identifier)}`,
    );
  }

  @UseGuards(JwtAuthGuard)
  @Get(':id')
  async findOne(
    @Req() req: Request & { user: Account },
    @Param('id') id: string,
  ): Promise<MeetingGroupResponseDto> {
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
    const found = await this.meetingGroupsService.findOneBy([
      { id, authorId: req.user.userId },
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
    const found = await this.meetingGroupsService.findOneBy([
      { id, authorId: req.user.userId },
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
