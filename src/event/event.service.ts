import { Injectable } from '@nestjs/common';
import { EventDto } from './event.dto';
import { EventGateway } from './event.gateway';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { EventQueueJobNames, EventQueueNames } from './event.enum';

@Injectable()
export default class EventService {

  constructor(
    private readonly eventGateway: EventGateway,
    @InjectQueue(EventQueueNames.NOTIFICATION) private queue: Queue
  ) {
  }

  async sendUserNotification(eventDto: EventDto): Promise<void> {
    this.eventGateway.sendNotificationToUser(eventDto);
  }

  async queueUserNotification(eventDto: EventDto): Promise<void> {
    await this.queue.add(EventQueueJobNames.SEND, eventDto)
  }
}
