import { Body, Controller, Post } from '@nestjs/common';
import EventService from './event.service';
import { EventDto } from './event.dto';
import { ApiTags } from '@nestjs/swagger';

@Controller('event')
@ApiTags('Event')
export class EventController {
  constructor(private readonly eventService: EventService) { }

  @Post('send')
  async sendNotification(
    @Body() dto
  ): Promise<void> {
    this.eventService.sendUserNotification(dto);
  }

  @Post('queue')
  async queueNotification(
    @Body() dto: EventDto
  ): Promise<void> {
    this.eventService.queueUserNotification(dto);
  }
}
