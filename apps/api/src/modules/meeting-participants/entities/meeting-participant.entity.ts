import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';
import { MeetingGroup } from '../../meeting-groups/entities/meeting-group.entity';
import {
  ParticipantAuthState,
  ParticipantInvitationState,
} from '../../../libs/constants';

@Entity('meeting_participants')
@Unique(['meetingGroupId', 'email'])
@Index(['meetingGroupId'])
@Index(['meetingGroupId', 'userId'])
export class MeetingParticipant {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  userId?: string;

  @ManyToOne(() => User, (user) => user.participations, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'userId' })
  user?: User;

  @Column()
  meetingGroupId: string;

  @ManyToOne(() => MeetingGroup, (meetingGroup) => meetingGroup.participants, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meetingGroupId' })
  meetingGroup: MeetingGroup;

  @Column()
  email: string;

  @Column({
    enum: ParticipantInvitationState,
    default: ParticipantInvitationState.PENDING,
  })
  invitationState: ParticipantInvitationState;

  @Column({
    enum: ParticipantAuthState,
    default: ParticipantAuthState.UNAUTHORIZED,
  })
  authState: ParticipantAuthState;

  @Column({ default: false })
  required: boolean;

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
