import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { EventBus } from '@nestjs/cqrs';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import {
  EnvironmentVariables,
  ParticipantAuthState,
  ParticipantInvitationState,
  SanitizedRoutes,
  VerificationType,
  VerificationValue,
} from '../../libs/constants';
import { TokenService } from '../auth/token.service';
import { VerificationsService } from '../verifications/verifications.service';
import { MeetingParticipantAuthorizedEvent } from './events/meeting-participant-authorized.event';
import { CreateMeetingParticipantDto } from './dto/create-meeting-participant.dto';
import { UpdateMeetingParticipantDto } from './dto/update-meeting-participant.dto';
import { MeetingParticipant } from './entities/meeting-participant.entity';

const ALLOWED_INVITATION_TRANSITIONS: Record<
  ParticipantInvitationState,
  ParticipantInvitationState[]
> = {
  [ParticipantInvitationState.PENDING]: [
    ParticipantInvitationState.ACCEPTED,
    ParticipantInvitationState.DECLINED,
  ],
  [ParticipantInvitationState.ACCEPTED]: [ParticipantInvitationState.DECLINED],
  [ParticipantInvitationState.DECLINED]: [],
};

const ALLOWED_AUTH_TRANSITIONS: Record<
  ParticipantAuthState,
  ParticipantAuthState[]
> = {
  [ParticipantAuthState.UNAUTHORIZED]: [
    ParticipantAuthState.AUTHORIZED,
    ParticipantAuthState.NOT_REQUIRED,
  ],
  [ParticipantAuthState.AUTHORIZED]: [
    ParticipantAuthState.UNAUTHORIZED,
    ParticipantAuthState.NOT_REQUIRED,
  ],
  [ParticipantAuthState.NOT_REQUIRED]: [
    ParticipantAuthState.UNAUTHORIZED,
    ParticipantAuthState.AUTHORIZED,
  ],
};

@Injectable()
export class MeetingParticipantsService {
  constructor(
    @InjectRepository(MeetingParticipant)
    private readonly repository: Repository<MeetingParticipant>,
    @Inject(ConfigService)
    private readonly configService: ConfigService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    @Inject(VerificationsService)
    private readonly verificationService: VerificationsService,
    private readonly eventBus: EventBus,
  ) {}

  private validateInvitationStateTransition(
    current: ParticipantInvitationState,
    next: ParticipantInvitationState,
  ): void {
    const allowed = ALLOWED_INVITATION_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Invalid invitation state transition from '${current}' to '${next}'`,
        code: 'INVALID_INVITATION_STATE_TRANSITION',
        details: {
          current,
          next,
          allowed: allowed.length > 0 ? allowed : 'none',
        },
      });
    }
  }

  private validateAuthStateTransition(
    current: ParticipantAuthState,
    next: ParticipantAuthState,
  ): void {
    const allowed = ALLOWED_AUTH_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Invalid auth state transition from '${current}' to '${next}'`,
        code: 'INVALID_AUTH_STATE_TRANSITION',
        details: {
          current,
          next,
          allowed: allowed.length > 0 ? allowed : 'none',
        },
      });
    }
  }

  async create(
    createMeetingParticipantDto: CreateMeetingParticipantDto & {
      createdBy: string;
    },
  ) {
    const invitationState =
      createMeetingParticipantDto.invitationState ??
      ParticipantInvitationState.PENDING;
    const authState =
      createMeetingParticipantDto.authState ??
      ParticipantAuthState.UNAUTHORIZED;

    const entity = this.repository.create({
      ...createMeetingParticipantDto,
      invitationState,
      authState,
    });

    const result = await this.repository.save(entity);
    if (authState && ParticipantAuthState.AUTHORIZED === authState)
      return result;
    const ttl = this.configService.get<number>(EnvironmentVariables.TOKEN_TTL)!;
    const expiresIn = ttl * 1000 * 24 * 7;
    const expiresAt = new Date(Date.now() + expiresIn);
    await this.verificationService.create({
      identifier: this.tokenService.randomHash(),
      value: this.tokenService.sign(
        {
          type: VerificationType.EMAIL_INVITATION,
          id: result.id,
          to: result.email,
          after: SanitizedRoutes.MEETING_INVITATION_ACCEPTED,
        } as VerificationValue,
        { expiresIn },
      ),
      expiresAt,
    });
    return result;
  }

  async findAll() {
    return await this.repository.find();
  }

  async findAllBy(
    where:
      | FindOptionsWhere<MeetingParticipant>
      | FindOptionsWhere<MeetingParticipant>[],
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(
    id: string,
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where:
      | FindOptionsWhere<MeetingParticipant>
      | FindOptionsWhere<MeetingParticipant>[],
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(
    id: string,
    updateMeetingParticipantDto: UpdateMeetingParticipantDto,
  ) {
    const existing = await this.findOne(id);
    if (!existing) {
      throw new NotFoundException({
        message: 'MeetingParticipant not found',
        code: 'NOT_FOUND',
      });
    }

    const newInvitationState = updateMeetingParticipantDto.invitationState;
    const newAuthState = updateMeetingParticipantDto.authState;

    if (newInvitationState) {
      this.validateInvitationStateTransition(
        existing.invitationState,
        newInvitationState,
      );
    }

    if (newAuthState) {
      this.validateAuthStateTransition(existing.authState, newAuthState);
    }

    const updateData: Partial<MeetingParticipant> = {
      ...updateMeetingParticipantDto,
    };
    if (newInvitationState) {
      updateData.invitationState = newInvitationState;
    }
    if (newAuthState) {
      updateData.authState = newAuthState;
    }

    const updated = await this.repository.update(id, updateData);
    if (!updated.affected) {
      throw new NotFoundException();
    }
    const result = await this.findOne(id);
    if (result && result.authState === ParticipantAuthState.AUTHORIZED) {
      this.eventBus.publish(
        new MeetingParticipantAuthorizedEvent(result),
      );
    }
    return result;
  }

  async remove(id: string) {
    const meeting = await this.findOne(id);
    if (!meeting) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(meeting.id);
  }
}
