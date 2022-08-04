import { NestFactory } from '@nestjs/core';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(AppModule, {
    transport: Transport.RMQ,
    options: {
      urls:['amqp://guest:guest@rabbitmq:5672'],
      queue: 'image_queue',
      queueOptions: {
        durable: false
      }
    }
  });
  await app.listen();
}
bootstrap();
