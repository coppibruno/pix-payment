import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import * as amqp from 'amqplib';

@Injectable()
export class RabbitMQService {
  private readonly logger = new Logger(RabbitMQService.name);
  private connection;
  private channel;

  constructor(private configService: ConfigService) {}

  async onModuleInit() {
    await this.connect();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async connect() {
    try {
      const rabbitmqUrl = this.configService.get(
        'RABBITMQ_URL',
        'amqp://admin:admin@localhost:5672',
      );
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declara a fila pix_payments
      await this.channel.assertQueue('pix_payments', {
        durable: true,
      });

      this.logger.log('Conectado ao RabbitMQ');
    } catch (error) {
      this.logger.error('Erro ao conectar com RabbitMQ:', error);
      throw error;
    }
  }

  async sendPaymentNotification(chargeId: string): Promise<void> {
    try {
      if (!this.channel) {
        await this.connect();
      }

      const message = {
        charge_id: chargeId,
        timestamp: new Date().toISOString(),
        message_id: `msg_${Date.now()}_${Math.random().toString(36).substring(2)}`,
      };

      await this.channel.sendToQueue(
        'pix_payments',
        Buffer.from(JSON.stringify(message)),
        {
          persistent: true,
          messageId: message.message_id,
        },
      );

      this.logger.log(
        `Notificação de pagamento enviada para charge_id: ${chargeId}`,
      );
    } catch (error) {
      this.logger.error('Erro ao enviar notificação de pagamento:', error);
      throw error;
    }
  }

  private async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Conexão com RabbitMQ fechada');
    } catch (error) {
      this.logger.error('Erro ao fechar conexão com RabbitMQ:', error);
    }
  }
}
