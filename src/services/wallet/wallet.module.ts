import { Module } from '@nestjs/common';
import { SequelizeModule } from '@nestjs/sequelize';
import { Wallet } from './wallet.model';
import { WalletService } from './wallet.service';
import { WalletController } from './wallet.controller';
import { RabbitMQService } from '../../common/rabbitMQ.service';

@Module({
  imports: [SequelizeModule.forFeature([Wallet]),

  ],
  providers: [WalletService, RabbitMQService],
  controllers: [WalletController],
})
export class WalletModule {}