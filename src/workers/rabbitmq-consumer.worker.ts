import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Repository } from 'typeorm';
import * as amqp from 'amqplib';
import { Charge, ChargeStatus } from '../database/entities/charge.entity';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../database/schemas/notification-log.schema';

@Injectable()
export class RabbitMQConsumerWorker {
  private readonly logger = new Logger(RabbitMQConsumerWorker.name);
  private connection;
  private channel;

  constructor(
    private configService: ConfigService,
    @InjectRepository(Charge)
    private chargesRepository: Repository<Charge>,
    @InjectModel(NotificationLog.name)
    private notificationLogModel: Model<NotificationLogDocument>,
  ) {}

  async onModuleInit() {
    await this.startConsumer();
  }

  async onModuleDestroy() {
    await this.close();
  }

  private async startConsumer() {
    try {
      const rabbitmqUrl = this.configService.get(
        'RABBITMQ_URL',
        'amqp://admin:admin@localhost:5672',
      );
      this.connection = await amqp.connect(rabbitmqUrl);
      this.channel = await this.connection.createChannel();

      // Declara a fila
      await this.channel.assertQueue('pix_payments', {
        durable: true,
      });

      // Configura o consumer
      await this.channel.consume('pix_payments', async (msg) => {
        if (msg) {
          try {
            await this.processPaymentNotification(msg);
            this.channel.ack(msg);
          } catch (error) {
            this.logger.error('Erro ao processar mensagem:', error);
            this.channel.nack(msg, false, false); // Rejeita a mensagem
          }
        }
      });

      this.logger.log('Worker de pagamentos iniciado');
    } catch (error) {
      this.logger.error('Erro ao iniciar worker:', error);
      throw error;
    }
  }

  private async processPaymentNotification(msg: amqp.ConsumeMessage) {
    const message = JSON.parse(msg.content.toString());
    const { charge_id, timestamp, message_id } = message;

    this.logger.log(
      `Processando notificação de pagamento para charge_id: ${charge_id}`,
    );

    // Busca a cobrança no PostgreSQL
    const charge = await this.chargesRepository.findOne({
      where: { id: charge_id },
    });
    if (!charge) {
      this.logger.error(`Cobrança não encontrada: ${charge_id}`);
      return;
    }

    // Verifica se já foi paga
    if (charge.status === ChargeStatus.PAID) {
      this.logger.warn(`Cobrança ${charge_id} já foi paga anteriormente`);
      return;
    }

    const previousStatus = charge.status;

    // Atualiza o status para pago no PostgreSQL
    charge.status = ChargeStatus.PAID;
    await this.chargesRepository.save(charge);

    // Salva o log da notificação no MongoDB
    const notificationLog = new this.notificationLogModel({
      charge_id,
      received_at: new Date(timestamp),
      previous_status: previousStatus,
      new_status: ChargeStatus.PAID,
      message_id,
      metadata: {
        processed_at: new Date(),
        worker_id: process.pid,
        rabbitmq_message: message,
      },
    });

    await notificationLog.save();

    this.logger.log(
      `Cobrança ${charge_id} atualizada para status: ${ChargeStatus.PAID}`,
    );
    this.logger.log(
      `Status anterior: ${previousStatus}, Novo status: ${ChargeStatus.PAID}`,
    );
    this.logger.log(
      `Log de notificação salvo no MongoDB para charge_id: ${charge_id}`,
    );
  }

  private async close() {
    try {
      if (this.channel) {
        await this.channel.close();
      }
      if (this.connection) {
        await this.connection.close();
      }
      this.logger.log('Worker de pagamentos finalizado');
    } catch (error) {
      this.logger.error('Erro ao fechar worker:', error);
    }
  }
}
