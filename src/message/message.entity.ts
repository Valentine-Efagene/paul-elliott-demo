import { Column, Entity } from 'typeorm';
import { MessageStatus, MessageType } from './message.enums';
import { AbstractBaseEntity } from '../common/common.pure.entity';

@Entity({ name: 'notifications' })
export class Message extends AbstractBaseEntity {
  @Column({ nullable: false })
  email: string;

  @Column({ nullable: true })
  title: string;

  @Column({ nullable: true })
  link?: string;

  @Column({ nullable: true })
  message?: string;

  @Column({
    type: 'enum',
    enum: MessageStatus,
    default: MessageStatus.UNREAD
  })
  status: MessageStatus

  @Column({
    type: 'enum',
    enum: MessageType,
    default: MessageType.INFO
  })
  type: MessageType
}
