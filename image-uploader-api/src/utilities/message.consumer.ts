import { MailerService } from "@nestjs-modules/mailer";
import { Process, Processor } from "@nestjs/bull";
import { Job } from "bull";

@Processor('message-queue')
export class MessageConsumer {
  constructor(private mailerService: MailerService) {}

  @Process('message-job')
  messageJob(job: Job<any>) {
    const { email, resetHash } = job.data;

    this.mailerService.sendMail({
      to: email,
      subject: 'Reset password',
      template: '../../src/mail/email',
      context: {
        resetHash: resetHash
      }
    });
  }
}