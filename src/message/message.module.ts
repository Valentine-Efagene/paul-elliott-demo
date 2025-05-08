import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Message } from './message.entity';
import { MessageController } from './message.controller';
import { MessageService } from './message.service';
import { CustomNamingStrategy } from '../common/helpers/CustomNamingStrategy';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'mysql',
      host: process.env.DB_HOST ?? 'localhost',
      port: Number(process.env.DB_PORT) ?? 3306,
      username: process.env.DB_USERNAME ?? 'root',
      password: process.env.DB_PASSWORD ?? '',
      database: process.env.DB_NAME,
      entities: [
        // Don't add intermediate tables, or it will throw an error about only one key
        Message
      ],
      synchronize: process.env.DB_HOST === 'localhost',
      namingStrategy: new CustomNamingStrategy(),
    })],
  providers: [MessageService],
  controllers: [MessageController],
  exports: [MessageService]
})
export class MessageModule { }
