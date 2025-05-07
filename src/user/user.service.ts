import { BadRequestException, Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, FindOptionsWhere, Like, Repository } from 'typeorm';
import { User } from './user.entity';
import * as bcrypt from 'bcrypt';
import { AssignRolesDto, CreateUserDto, UpdateUserDto } from './user.dto';
import { UserSuspension } from '../user_suspensions/user_suspensions.entity';
import { Role } from '../role/role.entity';
import { FilterOperator, paginate, Paginated, PaginateQuery } from 'nestjs-paginate';

@Injectable()
export class UserService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Role)
    private readonly roleRepository: Repository<Role>,

    private readonly dataSource: DataSource
  ) { }

  async create({ password, ...rest }: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const entity = this.userRepository.create({
      ...rest,
      password: hashedPassword
    });

    const newUser = await this.userRepository.save(entity);

    const role = await this.roleRepository.findOneBy({
      name: 'user'
    })

    await this.assignRoles(newUser.id, {
      roleIds: [role.id]
    })

    return newUser
  }

  async createAdmin({ password, ...rest }: CreateUserDto): Promise<User> {
    const hashedPassword = await bcrypt.hash(password, 10);

    const entity = this.userRepository.create({
      ...rest,
      password: hashedPassword
    });

    const newUser = await this.userRepository.save(entity)

    const adminRole = await this.roleRepository.findOneBy({
      name: 'admin'
    })

    await this.assignRoles(newUser.id, {
      roleIds: [adminRole.id]
    })

    return newUser
  }

  async findAll(): Promise<User[]> {
    return this.userRepository.find();
  }

  findAllPaginated(
    query: PaginateQuery,
    params: {
      firstName?: string,
      lastName?: string,
      email?: string,
    }
  ): Promise<Paginated<User>> {
    const { firstName, lastName, email } = params

    const whereFilter: FindOptionsWhere<User> | FindOptionsWhere<User>[] = [
      { firstName: Like(`%${firstName}%`) },
      { lastName: Like(`%${lastName}%`) },
      { email: Like(`%${email}%`) },
    ]

    return paginate(query, this.userRepository, {
      sortableColumns: ['id', 'firstName', 'email', 'lastName', 'createdAt', 'updatedAt'],
      //nullSort: 'last',
      defaultSortBy: [['id', 'DESC']],
      loadEagerRelations: true,
      relations: ['roles'],
      searchableColumns: ['id', 'firstName', 'lastName', 'email'],
      //select: ['id'],
      // where: Object.values(params).length > 0 ? whereFilter : undefined,
      filterableColumns: {
        //name: [FilterOperator.EQ, FilterSuffix.NOT],
        price: [FilterOperator.LTE],
        propertyType: true,
        category: true,
        status: true,
        createdAt: true
      },
    });
  }

  findOne(id: number): Promise<User> {
    return this.userRepository.findOne({
      relations: {
        roles: true,
      },
      where: { id }
    });
  }

  findOneByEmail(email: string): Promise<User> {
    return this.userRepository.findOneBy({ email });
  }

  findOneByEmailVerificationToken(token: string): Promise<User> {
    return this.userRepository.findOneBy({ emailVerificationToken: token });
  }

  async updateOne(id: number, updateDto: UpdateUserDto): Promise<User> {
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException(`${User.name} with ID ${id} not found`);
    }

    this.userRepository.merge(user, updateDto);
    return this.userRepository.save(user);
  }

  async suspend(id: number, reason: string): Promise<User> {
    const queryRunner = this.dataSource.createQueryRunner()

    try {
      await queryRunner.connect()
      await queryRunner.startTransaction()
      const user: User = await this.findOne(id)

      if (!user) {
        throw new BadRequestException()
      }

      user.suspended = true

      const userSuspension = new UserSuspension()
      userSuspension.userId = user.id
      userSuspension.reason = reason

      await queryRunner.manager.save(userSuspension)
      await queryRunner.commitTransaction()
      return user
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async reinstate(id: number, reason: string): Promise<User> {
    const user: User = await this.findOne(id)

    if (!user) {
      throw new BadRequestException()
    }

    user.suspended = false
    return user
  }

  async assignRoles(id: number, dto: AssignRolesDto): Promise<User> {
    const user = await this.findOne(id)

    if (!user) {
      throw new BadRequestException('Invalid user ID')
    }

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      const rolePromises = dto.roleIds?.map(id => {
        return this.dataSource.getRepository(Role).findOneBy({ id })
      })

      const roles: Role[] = await Promise.all(rolePromises)
      user.roles = roles
      await queryRunner.manager.save(user)

      await queryRunner.commitTransaction()
      return user
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async revokeRoles(id: number, dto: AssignRolesDto): Promise<User> {
    const user = await this.findOne(id)

    if (!user) {
      throw new BadRequestException('Invalid role ID')
    }

    const oldRoleIds = user.roles
    const newRoles = oldRoleIds.filter(role => !dto.roleIds.includes(role.id))

    const queryRunner = this.dataSource.createQueryRunner()
    await queryRunner.connect()
    await queryRunner.startTransaction()

    try {
      user.roles = newRoles
      await queryRunner.manager.save(user)

      await queryRunner.commitTransaction()
      return user
    } catch (error) {
      await queryRunner.rollbackTransaction()
      throw error
    } finally {
      await queryRunner.release()
    }
  }

  async remove(id: number): Promise<void> {
    await this.userRepository.delete(id);
  }
}
