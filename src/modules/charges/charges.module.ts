import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { NotificationsModule } from '../notifications/notifications.module';
import { Charge } from '../../database/entities/charge.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Charge]), NotificationsModule],
  controllers: [ChargesController],
  providers: [ChargesService],
  exports: [ChargesService],
})
export class ChargesModule {}
