import { Module } from '@nestjs/common';
import { CallerService } from './caller.service';
import { RabbitMQService } from '../../common/rabbitMQ.service';

@Module({
  providers: [CallerService, RabbitMQService]
})
export class CallerModule {}
