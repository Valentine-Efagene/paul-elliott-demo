import { OnQueueEvent, Processor, WorkerHost } from '@nestjs/bullmq';
import { Job } from 'bullmq';
import { MailService } from './mail.service';
import { SendMailDto, SendVerificationMailDto } from './mail.dto';
import { MailQueueJobNames } from './mail.enums';
import { MailerService } from '@nestjs-modules/mailer';

@Processor('mail')
export class MailConsumer extends WorkerHost {
    async process(job: Job<any, any, string>, token?: string): Promise<any> {
        switch (job.name) {
            case MailQueueJobNames.SEND:
                await this.sendTestMail(job, token)
                break;

            case MailQueueJobNames.SEND_VERIFICATION_MESSAGE:
                await this.sendVerificationMail(job, token)
                break;

            default:
                break;
        }
    }
    constructor(
        private readonly mailService: MailService,
        private readonly mailerService: MailerService,
    ) {
        super()
    }

    async sendTestMail(job: Job<SendMailDto, void, string>, token?: string): Promise<any> {
        await this.mailService.send(job.data)
    }

    async sendVerificationMail(job: Job<SendVerificationMailDto, void, string>, token?: string): Promise<any> {
        const testMailDto: SendVerificationMailDto = job.data

        await this.mailerService.sendMail({
            to: testMailDto.receiverEmail,
            subject: 'Verification Email',
            template: './email-verification',
            context: {
                name: testMailDto.name,
                link: testMailDto.link
            }
        })
    }

    @OnQueueEvent('active')
    onActive(job: Job) {
        console.log(
            `Processing job ${job.id} of type ${job.name} with data ${job.data}...`,
        );
    }
}