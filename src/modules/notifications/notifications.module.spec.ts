import { NotificationsModule } from './notifications.module';

describe('NotificationsModule', () => {
  it('should be defined', () => {
    expect(NotificationsModule).toBeDefined();
  });

  it('should be a valid NestJS module class', () => {
    expect(typeof NotificationsModule).toBe('function');
  });

  it('should be a class', () => {
    expect(NotificationsModule).toBeInstanceOf(Function);
  });
});
