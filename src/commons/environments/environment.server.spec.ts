import { configDotenv } from 'dotenv';
import { environmentServer } from './environment.server';

describe('environmentServer', () => {
  beforeEach(async () => {
    configDotenv();
  });

  describe('verify', () => {
    it('should return "CHECK_ENV"', () => {
      expect(environmentServer.verify()).toBe('CHECK_ENV');
    });
  });
});
