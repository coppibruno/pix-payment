import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { HealthController } from './health.controller';
import { HealthService } from './health.service';
import { Charge } from '../../database/entities/charge.entity';
import { ConfigService } from '@nestjs/config';
import { ConfigModule } from '@nestjs/config';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge]),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        uri: configService.get(
          'MONGODB_URI',
          'mongodb://localhost:27017/pix_payment_logs',
        ),
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [HealthController],
  providers: [HealthService],
})
export class HealthModule {}
