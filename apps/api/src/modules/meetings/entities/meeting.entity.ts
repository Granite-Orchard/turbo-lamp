import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingStatus } from '../../../libs/constants';
import { MeetingAttendee } from '../../meeting-attendees/entities/meeting-attendee.entity';
import { MeetingGroup } from '../../meeting-groups/entities/meeting-group.entity';

@Entity('meetings')
@Index(['meetingGroupId'])
export class Meeting {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  externalEventId?: string;

  @OneToMany(
    () => MeetingAttendee,
    (meetingAttendee) => meetingAttendee.meeting,
  )
  attendees: MeetingAttendee[];

  @Column()
  meetingGroupId: string;

  @OneToOne(() => MeetingGroup, (meetingGroup) => meetingGroup.meeting, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meetingGroupId' })
  meetingGroup: MeetingGroup;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column({ type: 'enum', enum: MeetingStatus })
  status: MeetingStatus;

  @CreateDateColumn()
  createdAt: Date;

  @Column({ nullable: true })
  createdBy?: string;

  @UpdateDateColumn()
  updatedAt: Date;

  @Column({ nullable: true })
  updatedBy?: string;

  @DeleteDateColumn()
  deletedAt?: Date;

  @Column({ nullable: true })
  deletedBy?: string;
}
