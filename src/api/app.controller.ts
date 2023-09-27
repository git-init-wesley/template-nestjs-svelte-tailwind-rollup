import { Controller, Get } from '@nestjs/common';
import { AppService } from './app.service';
import { environmentServer } from '../commons/commons';

@Controller()
export class AppController {
  @Get('/verify')
  verify(): string {
    return 'CHECK';
  }

  @Get('/verify/env')
  verifyEnv(): string {
    return environmentServer.verify();
  }
  constructor(private readonly appService: AppService) {}
}
