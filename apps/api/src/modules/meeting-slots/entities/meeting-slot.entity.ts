import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  JoinColumn,
  ManyToOne,
  PrimaryGeneratedColumn,
  Unique,
  UpdateDateColumn,
} from 'typeorm';
import { MeetingGroup } from '../../meeting-groups/entities/meeting-group.entity';

@Entity('meeting_slots')
@Unique(['meetingGroupId', 'rank'])
export class MeetingSlot {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column()
  meetingGroupId: string;

  @ManyToOne(() => MeetingGroup, (meetingGroup) => meetingGroup.slots, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'meetingGroupId' })
  meetingGroup: MeetingGroup;

  @Column()
  start: Date;

  @Column()
  end: Date;

  @Column()
  rank: number;

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
