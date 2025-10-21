import { ChargesModule } from './charges.module';

describe('ChargesModule', () => {
  it('should be defined', () => {
    expect(ChargesModule).toBeDefined();
  });

  it('should be a valid NestJS module class', () => {
    expect(typeof ChargesModule).toBe('function');
  });

  it('should be a class', () => {
    expect(ChargesModule).toBeInstanceOf(Function);
  });
});
