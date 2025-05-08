import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { EventDto } from './event.dto';
import { EventQueueJobNames, EventQueueNames } from './event.enum';
import EventService from './event.service';

@Processor(EventQueueNames.NOTIFICATION)
export class EventConsumer extends WorkerHost {
    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        switch (job.name) {
            case EventQueueJobNames.SEND:
                await this.sendTestEvent(job, token)
                break;

            default:
                break;
        }
    }
    constructor(
        private readonly eventService: EventService
    ) {
        super()
    }

    async sendTestEvent(job: Job<EventDto, void, string>, token?: string): Promise<any> {
        await this.eventService.sendUserNotification(job.data)
    }

    @OnQueueEvent('active')
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }
}