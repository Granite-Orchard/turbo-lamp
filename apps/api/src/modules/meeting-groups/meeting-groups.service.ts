import {
  BadRequestException,
  Inject,
  Injectable,
  Logger,
  NotFoundException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import {
  EnvironmentVariables,
  MeetingGroupStatus,
  SanitizedRoutes,
  VerificationType,
  VerificationValue,
} from '../../libs/constants';
import { TokenService } from '../auth/token.service';
import { VerificationsService } from '../verifications/verifications.service';
import { CreateMeetingGroupDto } from './dto/create-meeting-group.dto';
import { UpdateMeetingGroupDto } from './dto/update-meeting-group.dto';
import { MeetingGroup } from './entities/meeting-group.entity';
import { ConfigService } from '@nestjs/config';

const ALLOWED_STATUS_TRANSITIONS: Record<
  MeetingGroupStatus,
  MeetingGroupStatus[]
> = {
  [MeetingGroupStatus.OPEN]: [MeetingGroupStatus.FINALIZED],
  [MeetingGroupStatus.FINALIZED]: [MeetingGroupStatus.CANCELLED],
  [MeetingGroupStatus.CANCELLED]: [],
};

@Injectable()
export class MeetingGroupsService {
  private readonly logger: Logger = new Logger(MeetingGroupsService.name);
  constructor(
    @InjectRepository(MeetingGroup)
    private readonly repository: Repository<MeetingGroup>,
    @Inject(VerificationsService)
    private readonly verificationsService: VerificationsService,
    @Inject(TokenService)
    private readonly tokenService: TokenService,
    private readonly configService: ConfigService,
  ) {}

  public validateStatusTransition(
    current: MeetingGroupStatus,
    next: MeetingGroupStatus,
  ): void {
    this.logger.debug('validateStatusTransition invoked', {
      correlationId: '40226802-4492-45f4-9f1c-7e5792dacd22',
      current,
      next,
    });
    const allowed = ALLOWED_STATUS_TRANSITIONS[current] || [];
    if (!allowed.includes(next)) {
      throw new BadRequestException({
        message: `Invalid status transition from '${current}' to '${next}'`,
        code: 'INVALID_STATUS_TRANSITION',
        details: {
          current,
          next,
          allowed: allowed.length > 0 ? allowed : 'none',
        },
      });
    }
  }

  public validateMeetingGroupConstraints(
    createMeetingGroupDto: CreateMeetingGroupDto & { createdBy: string },
  ): void {
    this.logger.debug('validateMeetingGroupConstraints invoked', {
      correlationId: 'ce3fede0-093c-445f-92fa-6d6700641d90',
      createMeetingGroupDto,
    });
    if (createMeetingGroupDto.after >= createMeetingGroupDto.before) {
      throw new BadRequestException({
        message: "'after' must be before 'before'",
        code: 'INVALID_TIME_CONSTRAINTS',
        details: {
          after: createMeetingGroupDto.after,
          before: createMeetingGroupDto.before,
        },
      });
    }

    if (createMeetingGroupDto.duration <= 0) {
      throw new BadRequestException({
        message: 'Duration must be greater than 0',
        code: 'INVALID_DURATION',
        details: {
          duration: createMeetingGroupDto.duration,
        },
      });
    }

    const status = createMeetingGroupDto.status as
      | MeetingGroupStatus
      | undefined;

    if (!status) {
      createMeetingGroupDto.status = MeetingGroupStatus.OPEN;
    } else if (status !== MeetingGroupStatus.OPEN) {
      throw new BadRequestException({
        message: 'MeetingGroup must be created with status OPEN',
        code: 'INVALID_INITIAL_STATUS',
      });
    }
  }

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: '2b99888a-aedf-4657-80f2-572141a07956',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where: FindOptionsWhere<MeetingGroup> | FindOptionsWhere<MeetingGroup>[],
    relations?: FindOptionsRelations<MeetingGroup>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: 'e63e07cc-92ce-47b9-aba8-06d94e025013',
      where,
      relations,
    });
    const defaultRelations: FindOptionsRelations<MeetingGroup> = {
      participants: true,
      calendar: true,
    };

    const mergedRelations = { ...defaultRelations, ...relations };

    return await this.repository.find({
      where,
      relations: mergedRelations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<MeetingGroup>) {
    this.logger.debug('findOne invoked', {
      correlationId: 'ef37ea02-72aa-40d0-84c2-4bf758b03623',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where: FindOptionsWhere<MeetingGroup> | FindOptionsWhere<MeetingGroup>[],
    relations?: FindOptionsRelations<MeetingGroup>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'fdcae60d-7db9-4cf0-a171-792949c97dc8',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async generateMagicLink(meetingGroupId: string): Promise<string> {
    this.logger.debug('generateMagicLink invoked', {
      correlationId: 'a3c4f3f4-82be-4c26-8087-c9d85dd9cc56',
      meetingGroupId,
    });
    const value: VerificationValue = {
      type: VerificationType.MAGIC_LINK_INVITATION,
      id: meetingGroupId,
      to: '',
      after: SanitizedRoutes.ONBOARDING_AUTH,
    };
    // 7 days
    const expiresIn = 60 * 1000 * 60 * 24 * 7;
    const expiresAt = new Date(Date.now() + expiresIn);
    const verification = await this.verificationsService.create({
      identifier: this.tokenService.randomHash(),
      value: this.tokenService.sign(value, { expiresIn }),
      expiresAt,
    });
    const apiUrl = this.configService.get<string>(
      EnvironmentVariables.BACKEND_URL,
    )!;
    const url = `${apiUrl}/api/core/v1/meeting-groups/${meetingGroupId}/accept?token=${encodeURIComponent(verification.identifier)}`;
    return url;
  }

  async create(
    createMeetingGroupDto: CreateMeetingGroupDto & { createdBy: string },
  ) {
    this.logger.debug('create invoked', {
      correlationId: '4ec99af0-11f3-4d0d-909b-71e3d235fb72',
      createMeetingGroupDto,
    });
    this.validateMeetingGroupConstraints(createMeetingGroupDto);
    return await this.repository.save(
      this.repository.create(createMeetingGroupDto),
    );
  }

  async update(id: string, updateMeetingGroupDto: UpdateMeetingGroupDto) {
    this.logger.debug('udpate invoked', {
      correlationId: 'bfda368d-88ed-4cbc-ac0f-e97d7eec04c2',
      id,
      updateMeetingGroupDto,
    });
    const meetingGroup = await this.findOne(id);
    if (!meetingGroup) {
      throw new NotFoundException({
        message: 'MeetingGroup not found',
        code: 'NOT_FOUND',
      });
    }

    if (updateMeetingGroupDto.status) {
      this.validateStatusTransition(
        meetingGroup.status,
        updateMeetingGroupDto.status,
      );
    }

    return await this.repository.update(id, updateMeetingGroupDto);
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: 'a79ad30f-38a6-4aaa-8633-733a46743946',
      id,
    });
    const meetingGroup = await this.findOne(id);
    if (!meetingGroup) {
      throw new NotFoundException();
    }
    return await this.repository.softDelete(meetingGroup.id);
  }
}
