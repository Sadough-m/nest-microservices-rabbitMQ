import { Inject, Injectable, OnModuleInit } from '@nestjs/common';
import { RabbitMQService } from '../../common/rabbitMQ.service';
import { WINSTON_MODULE_NEST_PROVIDER } from 'nest-winston';
import { Logger } from 'winston';

@Injectable()
export class CallerService implements OnModuleInit{
  constructor(private readonly rabbitMQService: RabbitMQService,
  @Inject(WINSTON_MODULE_NEST_PROVIDER) private readonly logger: Logger,

) {
  }

  async onModuleInit() {
    console.log('Microservice has started');
    await this.init();
  }
  async init() {
    await this.rabbitMQService.connect();
    const queues = ['/wallets', '/wallets:id', '/wallets/top-tokens/'];
    for (const queue of queues) {
      await this.rabbitMQService.createQueue(queue);
    }
    let callerNumber = 0;
    setInterval(async () => {
      callerNumber += 1;
      const randomQueue = queues[Math.floor(Math.random() * 3)];
       this.rabbitMQService.sendRPCMessage(randomQueue, { address: '0xa4dbe6bc0748202fa1ce6b81a42c563fe9b06757', callerNumber: callerNumber ,timestamp: Date.now() })
         .then((response) => {
           this.logger.warn(`${randomQueue} success in ${Date.now()-response.timestamp} millisecond`);
         })
         .catch(err=>{
           console.log(err.message)
           this.logger.error(`${randomQueue} : ${err.message} `);
         });
    }, 1200);
  }

}
