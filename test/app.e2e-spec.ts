import { Test, TestingModule } from '@nestjs/testing';
import { INestApplication } from '@nestjs/common';
import * as request from 'supertest';
import { AppModule } from '../src/api/app.module';
import { configDotenv } from 'dotenv';

describe('AppController (e2e)', () => {
  let app: INestApplication;

  beforeEach(async () => {
    configDotenv();
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [AppModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  it('/verify (GET)', () => {
    return request(app.getHttpServer())
      .get('/verify')
      .expect(200)
      .expect('CHECK');
  });

  it('/verify/env (GET)', () => {
    return request(app.getHttpServer())
      .get('/verify/env')
      .expect(200)
      .expect('CHECK_ENV');
  });
});
