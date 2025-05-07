import { Column, Entity, JoinTable, ManyToMany } from 'typeorm';
import { BaseEntity } from 'src/common/helpers/BaseEntity';
import { Role } from 'src/role/role.entity';

@Entity({ name: 'permission' })
export class Permission extends BaseEntity {
  @Column({ nullable: true })
  name: string;

  @ManyToMany(() => Role, role => role.permissions)
  roles: Role[]
}
