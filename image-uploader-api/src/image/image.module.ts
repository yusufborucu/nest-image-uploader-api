import { CacheModule, Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from '../cloudinary/cloudinary.service';
import { ImageSchema } from '../models/image.schema';
import { ImageController } from './image.controller';
import { ImageService } from './image.service';
import * as redisStore from 'cache-manager-redis-store';
import { ClientsModule, Transport } from '@nestjs/microservices';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'Image', schema: ImageSchema }]),
    CacheModule.register({
      store: redisStore,
      host: "redis",
      port: 6379
    }),
    ClientsModule.register([{
      name: 'MAIL_SERVICE',
      transport: Transport.RMQ,
      options: {
        urls: ['amqp://guest:guest@rabbitmq:5672'],
        queue: 'image_queue',
        queueOptions: {
          durable: false
        }
      }
    }])
  ],
  controllers: [ImageController],
  providers: [ImageService, CloudinaryService]
})
export class ImageModule {}
