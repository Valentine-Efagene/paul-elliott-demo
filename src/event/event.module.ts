import { Module } from "@nestjs/common";
import { EventGateway } from "./event.gateway";
import { JwtModule } from "@nestjs/jwt";
import { BullModule } from '@nestjs/bullmq';
import { EventController } from "./event.controller";
import EventService from "./event.service";
import { EventQueueNames } from "./event.enum";
import { EventConsumer } from "./event.consumer";

@Module({
  imports: [
    JwtModule,
    BullModule.forRoot({
      connection: {
        host: process.env.REDIS_HOST,
        port: parseInt(process.env.REDIS_PORT),
        username: process.env.REDIS_USERNAME,
        password: process.env.REDIS_PASSWORD,
      },
    }),
    BullModule.registerQueue({
      name: EventQueueNames.NOTIFICATION,
    }),],
  providers: [EventGateway, EventService, EventConsumer],
  controllers: [EventController],
  exports: [EventService]
})
export class EventModule { }