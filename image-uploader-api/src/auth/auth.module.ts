import { Module } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtStrategy } from './jwt.strategy';
import { MongooseModule } from '@nestjs/mongoose';
import { UserSchema } from '../models/user.schema';
import { BullModule } from '@nestjs/bull';
import { MessageConsumer } from '../utilities/message.consumer';
import { MailerModule } from '@nestjs-modules/mailer';
import { join } from 'path';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';

@Module({
  imports: [
    MongooseModule.forFeature([{ name: 'User', schema: UserSchema }]),
    BullModule.forRoot({
      redis: {
        host: "redis",
        port: 6379
      }
    }),
    BullModule.registerQueue({
      name: 'message-queue'
    }),
    MailerModule.forRootAsync({
      useFactory: async () => ({
        transport: {
          host: process.env.MAIL_HOST,
          secure: false,
          auth: {
            user: process.env.MAIL_USERNAME,
            pass: process.env.MAIL_PASSWORD
          }
        },
        defaults: {
          from: process.env.MAIL_USERNAME
        },
        template: {
          dir: join(__dirname, '../mail'),
          adapter: new HandlebarsAdapter,
          options: {
            strict: true
          }
        }
      })
    })
  ],
  providers: [AuthService, JwtStrategy, MessageConsumer],
  controllers: [AuthController]
})
export class AuthModule {}
