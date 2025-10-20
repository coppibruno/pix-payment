import { ConfigModule, ConfigService } from '@nestjs/config';
import { RedisModule } from '@nestjs-modules/ioredis';

export const RedisConfig = RedisModule.forRootAsync({
  imports: [ConfigModule],
  useFactory: (configService: ConfigService) => ({
    type: 'single',
    url: `redis://${configService.get('REDIS_HOST', 'localhost')}:${configService.get('REDIS_PORT', 6379)}`,
    options: {
      password: configService.get('REDIS_PASSWORD'),
      retryDelayOnFailover: 100,
      maxRetriesPerRequest: 3,
    },
  }),
  inject: [ConfigService],
});
