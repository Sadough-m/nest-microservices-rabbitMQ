import { Module } from '@nestjs/common';
import { APP_INTERCEPTOR, APP_FILTER } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { HttpExceptionFilter } from './common/http-exception.filter';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston.config';
import { SequelizeModule } from '@nestjs/sequelize';
import {RabbitMQService} from './common/rabbitMQ.service';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { CallerModule } from './services/caller/caller.module';
import { WalletModule } from './services/wallet/wallet.module';
import { WalletController } from './services/wallet/wallet.controller';
import { CallerController } from './services/caller/caller.controller';

@Module({
  imports: [
    WinstonModule.forRoot(winstonConfig),
    ConfigModule.forRoot({ isGlobal: true, envFilePath: '.env' }),
    SequelizeModule.forRoot({
      dialect: 'postgres',
      host: process.env.DATABASE_HOST,
      port: parseInt(process.env.DATABASE_PORT),
      username: process.env.DATABASE_USER,
      password: process.env.DaTABASE_PASSWORD,
      database: process.env.DATABASE_NAME,
      autoLoadModels: true, // Automatically load all models registered in their respective modules
      synchronize: true, // Enable auto-syncing of models to the database (disable in production)
    }),
    CallerModule,
    WalletModule],
  // controllers: [AppController, WalletController, CallerController],
  providers: [
    { provide: APP_FILTER, useClass: HttpExceptionFilter },
    RabbitMQService,
    AppService],
})
export class AppModule {}
