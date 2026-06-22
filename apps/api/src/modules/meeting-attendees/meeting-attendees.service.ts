import { Injectable, Logger, NotFoundException } from '@nestjs/common';
import { CreateMeetingAttendeeDto } from './dto/create-meeting-attendee.dto';
import { UpdateMeetingAttendeeDto } from './dto/update-meeting-attendee.dto';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsRelations, FindOptionsWhere, Repository } from 'typeorm';
import { MeetingAttendee } from './entities/meeting-attendee.entity';

@Injectable()
export class MeetingAttendeesService {
  private readonly logger: Logger = new Logger(MeetingAttendeesService.name);
  constructor(
    @InjectRepository(MeetingAttendee)
    private readonly repository: Repository<MeetingAttendee>,
  ) {}
  async create(
    createMeetingAttendeeDto: CreateMeetingAttendeeDto & { createdBy: string },
  ) {
    this.logger.debug('create invoked', {
      correlationId: 'df33a549-a91d-477c-82ea-e2638b445527',
      createMeetingAttendeeDto,
    });
    const meetingAttendee = this.repository.create(createMeetingAttendeeDto);
    return await this.repository.save(meetingAttendee);
  }

  async findAll() {
    this.logger.debug('findAll invoked', {
      correlationId: 'cce0f7ff-90ac-44dd-a82e-2acd6488c98d',
    });
    return await this.repository.find();
  }

  async findAllBy(
    where:
      | FindOptionsWhere<MeetingAttendee>
      | FindOptionsWhere<MeetingAttendee>[],
    relations?: FindOptionsRelations<MeetingAttendee>,
  ) {
    this.logger.debug('findAllBy invoked', {
      correlationId: '3241f540-ca70-48c7-a130-2113b1072170',
      where,
      relations,
    });
    return await this.repository.find({
      where,
      relations,
    });
  }

  async findOne(id: string, relations?: FindOptionsRelations<MeetingAttendee>) {
    this.logger.debug('findOne invoked', {
      correlationId: '8e0dc85d-85f0-4c3d-a98a-519b2e192c0f',
      id,
      relations,
    });
    return await this.findOneBy({ id }, relations);
  }

  async findOneBy(
    where:
      | FindOptionsWhere<MeetingAttendee>
      | FindOptionsWhere<MeetingAttendee>[],
    relations?: FindOptionsRelations<MeetingAttendee>,
  ) {
    this.logger.debug('findOneBy invoked', {
      correlationId: 'ad756345-8134-4393-86b6-16b05ba7ccea',
      where,
      relations,
    });
    return await this.repository.findOne({
      where,
      relations,
    });
  }

  async update(id: string, updateMeetingAttendeeDto: UpdateMeetingAttendeeDto) {
    this.logger.debug('update invoked', {
      correlationId: 'a0e2181a-c72a-48a6-b9ee-69302dd474d9',
      id,
      updateMeetingAttendeeDto,
    });
    const meetingAttendee = await this.findOne(id);
    if (!meetingAttendee) {
      throw new NotFoundException();
    }
    return await this.repository.update(id, {
      ...meetingAttendee,
      ...updateMeetingAttendeeDto,
    });
  }

  async remove(id: string) {
    this.logger.debug('remove invoked', {
      correlationId: '8ded46d8-6b8b-4dbe-b7ed-3a419644be2a',
      id,
    });
    const meetingAttendee = await this.findOne(id);
    if (!meetingAttendee) {
      throw new NotFoundException();
    }
    return await this.repository.delete(meetingAttendee.id);
  }
}
