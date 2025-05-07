import {
  Body,
  Controller,
  Post,
  HttpStatus,
} from '@nestjs/common';
import { MailService } from './mail.service';
import { SendMailDto } from './mail.dto';
import { ApiResponse, ApiTags } from '@nestjs/swagger';
import { StandardApiResponse } from 'src/common/common.dto';
import OpenApiHelper from '../common/OpenApiHelper';
import { ResponseMessage } from '../common/common.enum';
import { SwaggerAuth } from '../common/guard/swagger-auth.guard';

@SwaggerAuth()
@Controller('mailer')
@ApiTags('Mailer')
@ApiResponse(OpenApiHelper.responseDoc)
export class MailController {
  constructor(private readonly mailService: MailService) { }

  @Post('send-queued')
  async sendQueued(
    @Body() sendMailDto: SendMailDto,
  ): Promise<StandardApiResponse<void>> {
    const data = await this.mailService.sendQueued(sendMailDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }

  @Post('send')
  async send(
    @Body() testMailDto: SendMailDto,
  ): Promise<StandardApiResponse<void>> {
    const data = await this.mailService.send(testMailDto);
    return new StandardApiResponse(HttpStatus.CREATED, ResponseMessage.CREATED, data);
  }
}
