import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { FindOptionsWhere, LessThanOrEqual, Like, MoreThanOrEqual, Repository } from 'typeorm';
import { Message } from './message.entity';
import { CreateMessageDto, MessageQueryDto, UpdateMessageDto } from './message.dto';

@Injectable()
export class MessageService {
  constructor(
    @InjectRepository(Message)
    private readonly notificationRepository: Repository<Message>
  ) { }

  async create(createMessageDto: CreateMessageDto): Promise<Message> {
    const entity = this.notificationRepository.create(createMessageDto);
    return await this.notificationRepository.save(entity);
  }

  async findAll(query: MessageQueryDto): Promise<Message[]> {
    const { limit = 100, page = 1, startDate, endDate, ...rest } = query
    const q: FindOptionsWhere<Message> | FindOptionsWhere<Message>[] = { ...rest }

    if (query.search) {
      q.title = Like(`%${query.search}%`)
    }

    if (query.startDate) {
      q.createdAt = MoreThanOrEqual(new Date(startDate))
    }

    if (query.endDate) {
      q.createdAt = LessThanOrEqual(new Date(endDate))
    }

    return this.notificationRepository.find({
      where: q,
      take: limit,
      skip: (page - 1) * limit
    });
  }

  findOne(id: number): Promise<Message> {
    return this.notificationRepository.findOne({
      where: { id },
    });
  }

  async updateOne(id: number, updateDto: UpdateMessageDto): Promise<Message> {
    const notification = await this.notificationRepository.findOneBy({ id });

    if (!notification) {
      throw new NotFoundException(`${Message.name} with ID ${id} not found`);
    }

    this.notificationRepository.merge(notification, updateDto);
    return this.notificationRepository.save(notification);
  }

  async remove(id: number): Promise<void> {
    await this.notificationRepository.delete(id);
  }
}
