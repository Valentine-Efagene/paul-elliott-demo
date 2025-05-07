import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { SendMailDto } from './mail.dto';
import { MailQueueJobNames } from './mail.enums';

@Processor('mail')
export class MailConsumer extends WorkerHost {
    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        switch (job.name) {
            case MailQueueJobNames.SEND:
                await this.sendTestMail(job, token)
                break;

            default:
                break;
        }
    }
    constructor(
        private readonly mailService: MailService
    ) {
        super()
    }

    async sendTestMail(job: Job<SendMailDto, void, string>, token?: string): Promise<any> {
        await this.mailService.send(job.data)
    }

    @OnQueueEvent('active')
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }
}