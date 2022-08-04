import { MailerService } from '@nestjs-modules/mailer';
import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  constructor(private mailerService: MailerService) {}
  
  getHello(): string {
    return 'Hello World!';
  }

  sendImageCreatedMail(data: any) {
    this.mailerService.sendMail({
      to: data.email,
      subject: 'Uploaded Image',
      template: '../../src/templates/image_created',
      context: {
        link: data.link,
        note: data.note
      }
    });
  }
}
