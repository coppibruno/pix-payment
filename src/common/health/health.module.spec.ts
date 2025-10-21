import { HealthModule } from './health.module';

describe('HealthModule', () => {
  it('should be defined', () => {
    expect(HealthModule).toBeDefined();
  });

  it('should be a valid NestJS module class', () => {
    expect(typeof HealthModule).toBe('function');
  });

  it('should be a class', () => {
    expect(HealthModule).toBeInstanceOf(Function);
  });
});
