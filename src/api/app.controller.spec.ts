import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { configDotenv } from 'dotenv';

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    configDotenv();
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [AppService],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('verify', () => {
    it('should return "CHECK"', () => {
      expect(appController.verify()).toBe('CHECK');
    });
  });
  describe('verifyEnv', () => {
    it('should return "CHECK_ENV"', () => {
      expect(appController.verifyEnv()).toBe('CHECK_ENV');
    });
  });
});
