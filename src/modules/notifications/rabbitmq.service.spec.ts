import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { RabbitMQService } from './rabbitmq.service';

// Mock do amqplib
jest.mock('amqplib', () => ({
  connect: jest.fn(),
}));

describe('RabbitMQService', () => {
  let service: RabbitMQService;
  let configService: ConfigService;
  let mockConnection: any;
  let mockChannel: any;

  const mockConfigService = {
    get: jest.fn(),
  };

  beforeEach(async () => {
    // Reset mocks
    jest.clearAllMocks();

    // Mock connection and channel
    mockChannel = {
      assertQueue: jest.fn(),
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
        RabbitMQService,
        {
          provide: ConfigService,
          useValue: mockConfigService,
        },
      ],
    }).compile();

    service = module.get<RabbitMQService>(RabbitMQService);
    configService = module.get<ConfigService>(ConfigService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('onModuleInit', () => {
    it('should connect to RabbitMQ successfully', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );

      await service.onModuleInit();

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'RABBITMQ_URL',
        'amqp://admin:admin@localhost:5672',
      );
      expect(mockConnection.createChannel).toHaveBeenCalled();
      expect(mockChannel.assertQueue).toHaveBeenCalledWith('pix_payments', {
        durable: true,
      });
    });

    it('should use default URL when config is not provided', async () => {
      mockConfigService.get.mockReturnValue(undefined);

      await service.onModuleInit();

      expect(mockConfigService.get).toHaveBeenCalledWith(
        'RABBITMQ_URL',
        'amqp://admin:admin@localhost:5672',
      );
    });

    it('should handle connection errors', async () => {
      const error = new Error('Connection failed');
      const amqp = require('amqplib');
      amqp.connect.mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });
  });

  describe('sendPaymentNotification', () => {
    beforeEach(async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );
      await service.onModuleInit();
    });

    it('should send payment notification successfully', async () => {
      const chargeId = 'test-charge-id';
      mockChannel.sendToQueue.mockResolvedValue(true);

      await service.sendPaymentNotification(chargeId);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'pix_payments',
        expect.any(Buffer),
        {
          persistent: true,
          messageId: expect.stringMatching(/^msg_\d+_[a-z0-9]+$/),
        },
      );

      // Verifica o conteúdo da mensagem
      const callArgs = mockChannel.sendToQueue.mock.calls[0];
      const messageBuffer = callArgs[1];
      const message = JSON.parse(messageBuffer.toString());

      expect(message).toEqual({
        charge_id: chargeId,
        timestamp: expect.any(String),
        message_id: expect.stringMatching(/^msg_\d+_[a-z0-9]+$/),
      });
    });

    it('should reconnect if channel is not available', async () => {
      const chargeId = 'test-charge-id';

      // Simula que o canal não está disponível
      service['channel'] = null;
      service['connection'] = null;

      // Mock da reconexão
      const amqp = require('amqplib');
      amqp.connect.mockResolvedValue(mockConnection);
      mockChannel.sendToQueue.mockResolvedValue(true);

      await service.sendPaymentNotification(chargeId);

      expect(amqp.connect).toHaveBeenCalled();
      expect(mockChannel.sendToQueue).toHaveBeenCalled();
    });

    it('should handle send errors', async () => {
      const chargeId = 'test-charge-id';
      const error = new Error('Send failed');
      mockChannel.sendToQueue.mockRejectedValue(error);

      await expect(service.sendPaymentNotification(chargeId)).rejects.toThrow(
        'Send failed',
      );
    });

    it('should generate unique message IDs', async () => {
      const chargeId = 'test-charge-id';
      mockChannel.sendToQueue.mockResolvedValue(true);

      await service.sendPaymentNotification(chargeId);
      await service.sendPaymentNotification(chargeId);

      const firstCall = mockChannel.sendToQueue.mock.calls[0];
      const secondCall = mockChannel.sendToQueue.mock.calls[1];

      const firstMessage = JSON.parse(firstCall[1].toString());
      const secondMessage = JSON.parse(secondCall[1].toString());

      expect(firstMessage.message_id).not.toBe(secondMessage.message_id);
    });

    it('should include timestamp in message', async () => {
      const chargeId = 'test-charge-id';
      const beforeSend = new Date();
      mockChannel.sendToQueue.mockResolvedValue(true);

      await service.sendPaymentNotification(chargeId);

      const afterSend = new Date();
      const callArgs = mockChannel.sendToQueue.mock.calls[0];
      const message = JSON.parse(callArgs[1].toString());
      const messageTimestamp = new Date(message.timestamp);

      expect(messageTimestamp.getTime()).toBeGreaterThanOrEqual(
        beforeSend.getTime(),
      );
      expect(messageTimestamp.getTime()).toBeLessThanOrEqual(
        afterSend.getTime(),
      );
    });
  });

  describe('onModuleDestroy', () => {
    it('should close connection and channel successfully', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );
      await service.onModuleInit();

      mockChannel.close.mockResolvedValue(undefined);
      mockConnection.close.mockResolvedValue(undefined);

      await service.onModuleDestroy();

      expect(mockChannel.close).toHaveBeenCalled();
      expect(mockConnection.close).toHaveBeenCalled();
    });

    it('should handle close errors gracefully', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );
      await service.onModuleInit();

      const channelError = new Error('Channel close failed');
      const connectionError = new Error('Connection close failed');

      mockChannel.close.mockRejectedValue(channelError);
      mockConnection.close.mockRejectedValue(connectionError);

      // Não deve lançar erro
      await expect(service.onModuleDestroy()).resolves.toBeUndefined();
    });

    it('should handle case when connection is null', async () => {
      service['connection'] = null;
      service['channel'] = null;

      await expect(service.onModuleDestroy()).resolves.toBeUndefined();
    });
  });

  describe('private methods', () => {
    it('should handle connection errors in private connect method', async () => {
      const error = new Error('Connection failed');
      const amqp = require('amqplib');
      amqp.connect.mockRejectedValue(error);

      await expect(service.onModuleInit()).rejects.toThrow('Connection failed');
    });

    it('should handle channel creation errors', async () => {
      const error = new Error('Channel creation failed');
      mockConnection.createChannel.mockRejectedValue(error);
      const amqp = require('amqplib');
      amqp.connect.mockResolvedValue(mockConnection);

      await expect(service.onModuleInit()).rejects.toThrow(
        'Channel creation failed',
      );
    });
  });

  describe('queue configuration', () => {
    it('should assert queue with correct options', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );

      await service.onModuleInit();

      expect(mockChannel.assertQueue).toHaveBeenCalledWith('pix_payments', {
        durable: true,
      });
    });
  });

  describe('message persistence', () => {
    it('should send messages with persistent flag', async () => {
      mockConfigService.get.mockReturnValue(
        'amqp://admin:admin@localhost:5672',
      );
      await service.onModuleInit();

      const chargeId = 'test-charge-id';
      mockChannel.sendToQueue.mockResolvedValue(true);

      await service.sendPaymentNotification(chargeId);

      expect(mockChannel.sendToQueue).toHaveBeenCalledWith(
        'pix_payments',
        expect.any(Buffer),
        {
          persistent: true,
          messageId: expect.any(String),
        },
      );
    });
  });
});
