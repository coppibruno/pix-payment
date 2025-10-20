import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MongooseModule } from '@nestjs/mongoose';
import { NotificationsController } from './notifications.controller';
import { RabbitMQService } from './rabbitmq.service';
import { RabbitMQConsumerWorker } from '../../workers/rabbitmq-consumer.worker';
import { Charge } from '../../database/entities/charge.entity';
import {
  NotificationLog,
  NotificationLogSchema,
} from '../../database/schemas/notification-log.schema';

@Module({
  imports: [
    TypeOrmModule.forFeature([Charge]),
    MongooseModule.forFeature([
      { name: NotificationLog.name, schema: NotificationLogSchema },
    ]),
  ],
  controllers: [NotificationsController],
  providers: [RabbitMQService, RabbitMQConsumerWorker],
  exports: [RabbitMQService],
})
export class NotificationsModule {}
