import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './common/winston.config';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';

async function bootstrap() {
  // Create the HTTP-based app
  const app = await NestFactory.create(AppModule,{
    logger: WinstonModule.createLogger(winstonConfig),
  });

  // Enable global validation pipe with transformation
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,  // Enable transformation of query params
    }),
  );

  const configService = app.get(ConfigService); // Get ConfigService

  // Create the microservice within the same app
  const microservice = app.connectMicroservice({
    transport: Transport.RMQ,
    options: {
      urls: [`${configService.get<string>('RABBITMQ_URL')}:${configService.get<string>('RABBITMQ_PORT')}`],
      queue: 'microservice_queue',
      queueOptions: {
        durable: false,
      },
    },
  });

  // Swagger setup for HTTP endpoints
  const config = new DocumentBuilder()
    .setTitle('Hybrid Microservice API')
    .setDescription('HTTP API with microservice functionality')
    .setVersion('1.0')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('swagger', app, document);

  // Start the HTTP server and the microservice
  await app.startAllMicroservices();
  await app.listen(3000);
  console.log('Application is running on: http://localhost:3000');

}
bootstrap();
