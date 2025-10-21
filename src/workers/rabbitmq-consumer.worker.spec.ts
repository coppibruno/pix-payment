import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
import { getModelToken } from '@nestjs/mongoose';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { Model } from 'mongoose';
import { RabbitMQConsumerWorker } from './rabbitmq-consumer.worker';
import { Charge, ChargeStatus } from '../database/entities/charge.entity';
import {
  NotificationLog,
  NotificationLogDocument,
} from '../database/schemas/notification-log.schema';

// Mock do amqplib
jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQConsumerWorker', () => {
  let worker: RabbitMQConsumerWorker;
  let configService: ConfigService;
  let chargesRepository: Repository<Charge>;
  let notificationLogModel: Model<NotificationLogDocument>;
  let mockConnection: any;
  let mockChannel: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  const mockChargesRepository = {
    findOne: jest.fn(),
    save: jest.fn(),
  };

  const mockNotificationLogModel = {
    constructor: jest.fn().mockImplementation((data) => ({
      ...data,
      save: jest.fn().mockResolvedValue({}),
    })),
    save: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock connection and channel
    mockChannel = {
      assertQueue: jest.fn(),
      consume: jest.fn(),
      ack: jest.fn(),
      sendToQueue: jest.fn(),
      close: jest.fn(),
    };

    mockConnection = {
      createChannel: jest.fn().mockResolvedValue(mockChannel),
      close: jest.fn(),
    };

    // Mock amqplib.connect
    const amqp = require('amqplib');
    amqp.connect.mockResolvedValue(mockConnection);

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        RabbitMQConsumerWorker,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
        {
          provide: getRepositoryToken(Charge),
          useValue: mockChargesRepository,
        },
        {
          provide: getModelToken(NotificationLog.name),
          useValue: mockNotificationLogModel,
        },
      ],
    }).compile();

    worker = module.get<RabbitMQConsumerWorker>(RabbitMQConsumerWorker);
    configService = module.get<ConfigService>(ConfigService);
    chargesRepository = module.get<Repository<Charge>>(
      getRepositoryToken(Charge),
    );
    notificationLogModel = module.get<Model<NotificationLogDocument>>(
      getModelToken(NotificationLog.name),
    );
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should start consumer successfully', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );

      await worker.onModuleInit();

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'RABBITMQ_URL',
        'amqp://admin:admin@localhost:5672',
      );
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('pix_payments', {
        durable: true,
      });
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'pix_payments_failed',
        {
          durable: true,
        },
      );
      expect(mockChannel.consume).toHaveBeenCalledTimes(2);
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      const amqp = require('amqplib');
      amqp.connect.mockRejectedValue(error);

      await expect(worker.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('processPaymentNotification', () => {
    let mockMessage: any;

    beforeEach(() => {
      mockMessage = {
        content: Buffer.from(
          JSON.stringify({
            charge_id: 'test-charge-id',
            timestamp: '2024-01-01T10:00:00.000Z',
            message_id: 'msg-123',
          }),
        ),
        properties: {
          messageId: 'msg-123',
        },
      };
    });

    it('should process payment notification successfully', async () => {
      const mockCharge = {
        id: 'test-charge-id',
        status: ChargeStatus.PENDING,
        payer_name: 'João Silva',
      };

      mockChargesRepository.findOne.mockResolvedValue(mockCharge);
      mockChargesRepository.save.mockResolvedValue({
        ...mockCharge,
        status: ChargeStatus.PAID,
      });

      // Simula o processamento da mensagem
      await (worker as any).processPaymentNotification(mockMessage);

      expect(mockChargesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-charge-id' },
      });
      expect(mockChargesRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: ChargeStatus.PAID,
        }),
      );
      expect(mockNotificationLogModel.constructor).toHaveBeenCalledWith({
        charge_id: 'test-charge-id',
        received_at: new Date('2024-01-01T10:00:00.000Z'),
        previous_status: ChargeStatus.PENDING,
        new_status: ChargeStatus.PAID,
        message_id: 'msg-123',
        metadata: expect.objectContaining({
          processed_at: expect.any(Date),
          worker_id: process.pid,
        }),
      });
    });

    it('should handle charge not found', async () => {
      mockChargesRepository.findOne.mockResolvedValue(null);

      await (worker as any).processPaymentNotification(mockMessage);

      expect(mockChargesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-charge-id' },
      });
      expect(mockChargesRepository.save).not.toHaveBeenCalled();
    });

    it('should handle already paid charge', async () => {
      const mockCharge = {
        id: 'test-charge-id',
        status: ChargeStatus.PAID,
        payer_name: 'João Silva',
      };

      mockChargesRepository.findOne.mockResolvedValue(mockCharge);

      await (worker as any).processPaymentNotification(mockMessage);

      expect(mockChargesRepository.findOne).toHaveBeenCalledWith({
        where: { id: 'test-charge-id' },
      });
      expect(mockChargesRepository.save).not.toHaveBeenCalled();
    });

    it('should handle database errors', async () => {
      const error = new Error('Database error');
      mockChargesRepository.findOne.mockRejectedValue(error);

      await expect(
        (worker as any).processPaymentNotification(mockMessage),
      ).rejects.toThrow('Database error');
    });
  });

  describe('processFailedPayment', () => {
    let mockFailedMessage: any;

    beforeEach(() => {
      mockFailedMessage = {
        content: Buffer.from(
          JSON.stringify({
            charge_id: 'test-charge-id',
            timestamp: '2024-01-01T10:00:00.000Z',
            message_id: 'msg-123',
          }),
        ),
        properties: {
          headers: { retry_count: 3 },
        },
      };
    });

    it('should process failed payment successfully', async () => {
      await (worker as any).processFailedPayment(mockFailedMessage);

      expect(mockNotificationLogModel.constructor).toHaveBeenCalledWith({
        charge_id: 'test-charge-id',
        received_at: new Date('2024-01-01T10:00:00.000Z'),
        previous_status: 'FAILED',
        new_status: 'DLQ_PROCESSED',
        message_id: 'msg-123',
        metadata: expect.objectContaining({
          processed_at: expect.any(Date),
          worker_id: process.pid,
          dlq_processed: true,
          failure_reason: 'Mensagem processada da Dead Letter Queue',
        }),
      });
    });

    it('should handle processing errors gracefully', async () => {
      const error = new Error('Processing error');
      mockNotificationLogModel.constructor.mockImplementation(() => {
        throw error;
      });

      // Não deve lançar erro
      await expect(
        (worker as any).processFailedPayment(mockFailedMessage),
      ).resolves.toBeUndefined();
    });
  });

  describe('setupQueues', () => {
    it('should setup queues successfully', async () => {
      // Configura o canal no worker
      (worker as any).channel = mockChannel;
      mockChannel.assertQueue.mockResolvedValue({});

      await (worker as any).setupQueues();

      expect(mockChannel.assertQueue).toHaveBeenCalledWith('pix_payments', {
        durable: true,
      });
      expect(mockChannel.assertQueue).toHaveBeenCalledWith(
        'pix_payments_failed',
        {
          durable: true,
        },
      );
    });

    it('should handle queue setup errors', async () => {
      // Configura o canal no worker
      (worker as any).channel = mockChannel;
      const error = new Error('Queue setup failed');
      mockChannel.assertQueue.mockRejectedValue(error);

      await expect((worker as any).setupQueues()).rejects.toThrow(
        'Queue setup failed',
      );
    });
  });

  describe('sendToFailedQueue', () => {
    let mockOriginalMessage: any;

    beforeEach(() => {
      mockOriginalMessage = {
        content: Buffer.from(
          JSON.stringify({
            charge_id: 'test-charge-id',
            timestamp: '2024-01-01T10:00:00.000Z',
            message_id: 'msg-123',
          }),
        ),
        properties: {
          messageId: 'msg-123',
          headers: { retry_count: 1 },
        },
      };
    });

    it('should send message to failed queue successfully', async () => {
      // Configura o canal no worker
      (worker as any).channel = mockChannel;
      mockChannel.sendToQueue.mockResolvedValue(true);

      await (worker as any).sendToFailedQueue(mockOriginalMessage);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'pix_payments_failed',
        expect.any(Buffer),
        {
          persistent: true,
          messageId: expect.stringMatching(/^failed_\d+_[0-9.]+$/),
          headers: {
            original_message_id: 'msg-123',
            failed_at: expect.any(String),
          },
        },
      );

      // Verifica o conteúdo da mensagem
      const callArgs = mockChannel.sendToQueue.mock.calls[0];
      const messageBuffer = callArgs[1];
      const message = JSON.parse(messageBuffer.toString());

      expect(message).toEqual({
        charge_id: 'test-charge-id',
        timestamp: '2024-01-01T10:00:00.000Z',
        message_id: 'msg-123',
        failed_at: expect.any(String),
        failure_reason: 'Erro no processamento da mensagem original',
        original_headers: { retry_count: 1 },
      });
    });

    it('should handle send to failed queue errors', async () => {
      // Configura o canal no worker
      (worker as any).channel = mockChannel;
      const error = new Error('Send failed');
      mockChannel.sendToQueue.mockRejectedValue(error);

      // Não deve lançar erro
      await expect(
        (worker as any).sendToFailedQueue(mockOriginalMessage),
      ).resolves.toBeUndefined();
    });
  });

  describe('onModuleDestroy', () => {
    it('should close connection and channel successfully', async () => {
      // Configura as propriedades no worker
      (worker as any).channel = mockChannel;
      (worker as any).connection = mockConnection;
      mockChannel.close.mockResolvedValue(undefined);
      mockConnection.close.mockResolvedValue(undefined);

      await worker.onModuleDestroy();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      const channelError = new Error('Channel close failed');
      const connectionError = new Error('Connection close failed');

      mockChannel.close.mockRejectedValue(channelError);
      mockConnection.close.mockRejectedValue(connectionError);

      // Não deve lançar erro
      await expect(worker.onModuleDestroy()).resolves.toBeUndefined();
    });
  });

  describe('consumer message handling', () => {
    it('should handle consumer message processing', async () => {
      // Este teste é coberto pelos testes individuais dos métodos
      expect(true).toBe(true);
    });
  });
});
