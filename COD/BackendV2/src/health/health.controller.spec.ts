import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  it('returns server and database health', () => {
    const dataSource = { isInitialized: true } as DataSource;
    const controller = new HealthController(dataSource);

    expect(controller.checkHealth()).toEqual({
      status: 'ok',
      name: 'BlueLock BackendV2',
      database: 'ok',
    });
  });
});
