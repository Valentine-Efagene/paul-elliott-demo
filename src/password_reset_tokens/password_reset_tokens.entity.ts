import { Column, DeleteDateColumn, Entity, JoinColumn, OneToOne } from 'typeorm';
import { BaseEntity } from 'src/common/helpers/BaseEntity';
import { User } from 'src/user/user.entity';

@Entity({ name: 'password_reset_token' })
export class PasswordResetToken extends BaseEntity {
  @OneToOne(() => User, {
    //eager: true,
    onDelete: 'CASCADE',
    onUpdate: 'CASCADE',
  })
  @JoinColumn({ name: 'user_id' })
  user: User;

  @Column({
    nullable: false
  })
  email: string

  @Column({
    nullable: false
  })
  token: string

  @DeleteDateColumn({
    nullable: true,
    default: null
  })
  expiresAt: Date;
}
