import {
  Inject,
  Injectable,
  NotFoundException,
  BadRequestException,
  Logger,
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
  private readonly logger: Logger = new Logger(MeetingParticipantsService.name);
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
    this.logger.debug('validateInvitationStateTransition invoked', {
      correlationId: '6f979af9-f5c4-451e-b3a3-d977ff0dc4bb',
      current,
      next,
    });
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
    this.logger.debug('validateAuthStateTransition invoked', {
      correlationId: '3cda8f20-cff7-4a6b-958f-a441c6f37111',
      current,
      next,
    });
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
    this.logger.debug('create invoked', {
      correlationId: '701d2dee-9389-4d59-a528-23c61fb69ac9',
      createMeetingParticipantDto,
    });
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
    this.logger.debug('findAll invoked', {
      correlationId: '506b5026-239a-4fee-becd-55c8d57fa9a7',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where:
      | FindOptionsWhere<MeetingParticipant>
      | FindOptionsWhere<MeetingParticipant>[],
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: '5aebd511-b1e0-4fe6-bed2-a968c68a9a62',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(
    id: string,
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    this.logger.debug('findOne invoked', {
      correlationId: 'dd710db2-b63d-42d1-a353-97fb881bec06',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where:
      | FindOptionsWhere<MeetingParticipant>
      | FindOptionsWhere<MeetingParticipant>[],
    relations?: FindOptionsRelations<MeetingParticipant>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'c851e7e8-7556-486f-89b4-aeb6592043e0',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(
    id: string,
    updateMeetingParticipantDto: UpdateMeetingParticipantDto,
  ) {
    this.logger.debug('update invoked', {
      correlationId: '65a4839d-c574-4d1c-818d-91fcde126881',
      id,
      updateMeetingParticipantDto,
    });
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
      this.eventBus.publish(new MeetingParticipantAuthorizedEvent(result));
    }
    return result;
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '7721b01a-7917-4510-bb78-e267f167764b',
      id,
    });
    const meeting = await this.findOne(id);
    if (!meeting) {
      throw new NotFoundException();
    }
    return await this.repository.delete(meeting.id);
  }
}
