import { Repository } from 'typeorm';
import { Message } from './message.entity';

export class UserRepository extends Repository<Message> {
  // ...
}
