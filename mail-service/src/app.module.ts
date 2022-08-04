import { MailerModule } from '@nestjs-modules/mailer';
import { Module } from '@nestjs/common';
import { join } from 'path';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HandlebarsAdapter } from '@nestjs-modules/mailer/dist/adapters/handlebars.adapter';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    ConfigModule.forRoot(),
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
          dir: join(__dirname, './templates'),
          adapter: new HandlebarsAdapter,
          options: {
            strict: true
          }
        }
      })
    })
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
