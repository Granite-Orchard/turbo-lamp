import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  OneToMany,
  OneToOne,
  PrimaryGeneratedColumn,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingGroupStatus } from '../../../libs/constants';
import { Calendar } from '../../calendars/entities/calendar.entity';
import { MeetingParticipant } from '../../meeting-participants/entities/meeting-participant.entity';
import { MeetingSlot } from '../../meeting-slots/entities/meeting-slot.entity';
import { Meeting } from '../../meetings/entities/meeting.entity';
import { User } from '../../users/entities/user.entity';

@Entity('meeting_groups')
export class MeetingGroup {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @OneToOne(() => Meeting, (meeting) => meeting.meetingGroup)
  meeting?: Meeting;

  @OneToMany(() => MeetingSlot, (slot) => slot.meetingGroup)
  slots?: MeetingSlot[];

  @OneToMany(
    () => MeetingParticipant,
    (meetingParticipant) => meetingParticipant.meetingGroup,
  )
  participants?: MeetingParticipant[];

  @Column({
    type: 'enum',
    enum: MeetingGroupStatus,
    default: MeetingGroupStatus.OPEN,
  })
  status: MeetingGroupStatus;

  @Column()
  authorId: string;

  @ManyToOne(() => User, (user) => user.meetingGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'authorId' })
  author: User;

  @Column()
  calendarId: string;

  @ManyToOne(() => Calendar, (calendar) => calendar.meetingGroups, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'calendarId' })
  calendar: Calendar;

  @Column()
  summary: string;

  @Column({ nullable: true })
  magicLink?: string;

  @Column({ nullable: true })
  description?: string;

  @Column({ nullable: true })
  location?: string;

  @Column({ type: 'int' })
  duration: number;

  @Column({ type: 'timestamp' })
  after: Date;

  @Column({ type: 'timestamp' })
  before: Date;

  @Column()
  timezone: string;

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
