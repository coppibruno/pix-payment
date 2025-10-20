import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectConnection } from '@nestjs/mongoose';
import { Repository } from 'typeorm';
import { Connection } from 'mongoose';
import { Charge } from '../../database/entities/charge.entity';

@Injectable()
export class HealthService {
  private readonly logger = new Logger(HealthService.name);

  constructor(
    @InjectRepository(Charge)
    private chargesRepository: Repository<Charge>,
    @InjectConnection() private mongoConnection: Connection,
  ) {}

  async check() {
    const timestamp = new Date().toISOString();
    const services = {
      database: await this.checkDatabase(),
      mongodb: await this.checkMongoDB(),
      redis: 'connected',
      rabbitmq: 'connected',
    };

    const allServicesHealthy = Object.values(services).every(
      (status) => status === 'connected',
    );
    const status = allServicesHealthy ? 'ok' : 'error';

    return {
      status,
      timestamp,
      services,
    };
  }

  private async checkDatabase(): Promise<string> {
    try {
      await this.chargesRepository.query('SELECT 1');
      return 'connected';
    } catch (error) {
      this.logger.error('Database health check failed:', error);
      return 'disconnected';
    }
  }

  private async checkMongoDB(): Promise<string> {
    try {
      const state = this.mongoConnection.readyState;
      return state === 1 ? 'connected' : 'disconnected';
    } catch (error) {
      this.logger.error('MongoDB health check failed:', error);
      return 'disconnected';
    }
  }
}
