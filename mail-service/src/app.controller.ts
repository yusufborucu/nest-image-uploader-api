import { Controller, Get } from '@nestjs/common';
import { EventPattern } from '@nestjs/microservices';
import { AppService } from './app.service';

@Controller()
export class AppController {
  constructor(private readonly appService: AppService) {}

  @Get()
  getHello(): string {
    return this.appService.getHello();
  }

  @EventPattern('image-created')
  async handleImageCreatedEvent(data: Record<string, unknown>) {
    return await this.appService.sendImageCreatedMail(data);
  }
}
