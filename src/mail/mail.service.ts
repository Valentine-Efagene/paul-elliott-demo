import { Injectable } from '@nestjs/common';
import { MailerService } from '@nestjs-modules/mailer';
import { SendMailDto } from './mail.dto';
import { InjectQueue } from '@nestjs/bullmq';
import { Queue } from 'bullmq';
import { MailQueueJobNames } from './mail.enums';

@Injectable()
export class MailService {
  constructor(
    private mailerService: MailerService,
    @InjectQueue('mail') private mailQueue: Queue
  ) { }

  async send(testMailDto: SendMailDto): Promise<void> {
    await this.mailerService.sendMail({
      to: testMailDto.receiverEmail,
      subject: 'Test Email',
      template: './test',
      context: {
        name: testMailDto.name,
        message: testMailDto.message
      }
    })
  }

  async sendQueued(mailDto: SendMailDto): Promise<void> {
    const job = await this.mailQueue.add(MailQueueJobNames.SEND, mailDto)
  }
}
