import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { ChargesController } from './charges.controller';
import { ChargesService } from './charges.service';
import { RabbitMQService } from '../notifications/rabbitmq.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ChargeResponseDto } from './dto/charge-response.dto';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';
import {
  ChargeStatus,
  PaymentMethod,
} from '../../database/entities/charge.entity';

describe('ChargesController', () => {
  let controller: ChargesController;

  const mockChargesService = {
    createCharge: jest.fn(),
    getChargeById: jest.fn(),
  };

  const mockRabbitMQService = {
    sendPaymentNotification: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [ChargesController],
      providers: [
        {
          provide: ChargesService,
          useValue: mockChargesService,
        },
        {
          provide: RabbitMQService,
          useValue: mockRabbitMQService,
        },
      ],
    }).compile();

    controller = module.get<ChargesController>(ChargesController);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCharge', () => {
    it('should create a new PIX charge successfully', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
      };

      const expectedResponse: ChargeResponseDto = {
        charge_id: 'test-uuid',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        payment_method: PaymentMethod.PIX,
        pix_key: 'pix-abc123',
        expiration_date: new Date('2024-01-02T10:00:00.000Z'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockChargesService.createCharge.mockResolvedValue(expectedResponse);

      const result = await controller.createCharge(createChargeDto);

      expect(mockChargesService.createCharge).toHaveBeenCalledWith(
        createChargeDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should create a charge without description', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'Maria Santos',
        payer_document: '98765432100',
        amount: 5000,
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
      };

      const expectedResponse: ChargeResponseDto = {
        charge_id: 'test-uuid-2',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payer_name: 'Maria Santos',
        payer_document: '98765432100',
        amount: 5000,
        description: undefined,
        payment_method: PaymentMethod.PIX,
        pix_key: 'pix-def456',
        expiration_date: new Date('2024-01-02T10:00:00.000Z'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockChargesService.createCharge.mockResolvedValue(expectedResponse);

      const result = await controller.createCharge(createChargeDto);

      expect(mockChargesService.createCharge).toHaveBeenCalledWith(
        createChargeDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should create a credit card charge successfully', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento com cartão',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.CREDIT_CARD,
        card_number: '4111111111111111',
        card_expiry: '12/25',
        card_cvv: '123',
        card_holder_name: 'João Silva',
        installments: 3,
      };

      const expectedResponse: ChargeResponseDto = {
        charge_id: 'test-uuid',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento com cartão',
        payment_method: PaymentMethod.CREDIT_CARD,
        card_number: '************1111',
        card_holder_name: 'João Silva',
        installments: 3,
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockChargesService.createCharge.mockResolvedValue(expectedResponse);

      const result = await controller.createCharge(createChargeDto);

      expect(mockChargesService.createCharge).toHaveBeenCalledWith(
        createChargeDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should create a bank slip charge successfully', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento via boleto',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.BANK_SLIP,
        due_date: '2024-12-31',
      };

      const expectedResponse: ChargeResponseDto = {
        charge_id: 'test-uuid',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento via boleto',
        payment_method: PaymentMethod.BANK_SLIP,
        bank_slip_code: '12345678901234567890123456789012345678901234567',
        bank_slip_url: 'https://boleto.example.com/test-uuid',
        due_date: new Date('2024-12-31'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockChargesService.createCharge.mockResolvedValue(expectedResponse);

      const result = await controller.createCharge(createChargeDto);

      expect(mockChargesService.createCharge).toHaveBeenCalledWith(
        createChargeDto,
      );
      expect(result).toEqual(expectedResponse);
    });

    it('should handle service errors', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
      };

      const error = new Error('Database connection failed');
      mockChargesService.createCharge.mockRejectedValue(error);

      await expect(controller.createCharge(createChargeDto)).rejects.toThrow(
        'Database connection failed',
      );
      expect(mockChargesService.createCharge).toHaveBeenCalledWith(
        createChargeDto,
      );
    });
  });

  describe('getCharge', () => {
    it('should return a charge by id successfully', async () => {
      const chargeId = 'test-uuid';
      const expectedResponse: ChargeResponseDto = {
        charge_id: chargeId,
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
        pix_key: 'pix-abc123',
        expiration_date: new Date('2024-01-02T10:00:00.000Z'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockChargesService.getChargeById.mockResolvedValue(expectedResponse);

      const result = await controller.getCharge(chargeId);

      expect(mockChargesService.getChargeById).toHaveBeenCalledWith(chargeId);
      expect(result).toEqual(expectedResponse);
    });

    it('should throw NotFoundException when charge not found', async () => {
      const chargeId = 'non-existent-uuid';

      mockChargesService.getChargeById.mockRejectedValue(
        new NotFoundException('Cobrança não encontrada'),
      );

      await expect(controller.getCharge(chargeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockChargesService.getChargeById).toHaveBeenCalledWith(chargeId);
    });

    it('should handle service errors', async () => {
      const chargeId = 'test-uuid';
      const error = new Error('Redis connection failed');

      mockChargesService.getChargeById.mockRejectedValue(error);

      await expect(controller.getCharge(chargeId)).rejects.toThrow(
        'Redis connection failed',
      );
      expect(mockChargesService.getChargeById).toHaveBeenCalledWith(chargeId);
    });
  });

  describe('simulatePayment', () => {
    it('should simulate payment notification successfully', async () => {
      const simulatePaymentDto: SimulatePaymentDto = {
        charge_id: 'test-uuid',
      };

      mockRabbitMQService.sendPaymentNotification.mockResolvedValue(undefined);

      const result = await controller.simulatePayment(simulatePaymentDto);

      expect(mockRabbitMQService.sendPaymentNotification).toHaveBeenCalledWith(
        'test-uuid',
      );
      expect(result).toEqual({
        message: 'Notificação de pagamento enviada para a fila RabbitMQ',
      });
    });

    it('should handle RabbitMQ service errors', async () => {
      const simulatePaymentDto: SimulatePaymentDto = {
        charge_id: 'test-uuid',
      };

      const error = new Error('RabbitMQ connection failed');
      mockRabbitMQService.sendPaymentNotification.mockRejectedValue(error);

      await expect(
        controller.simulatePayment(simulatePaymentDto),
      ).rejects.toThrow('RabbitMQ connection failed');
      expect(mockRabbitMQService.sendPaymentNotification).toHaveBeenCalledWith(
        'test-uuid',
      );
    });

    it('should handle different charge IDs', async () => {
      const simulatePaymentDto: SimulatePaymentDto = {
        charge_id: 'another-test-uuid',
      };

      mockRabbitMQService.sendPaymentNotification.mockResolvedValue(undefined);

      const result = await controller.simulatePayment(simulatePaymentDto);

      expect(mockRabbitMQService.sendPaymentNotification).toHaveBeenCalledWith(
        'another-test-uuid',
      );
      expect(result).toEqual({
        message: 'Notificação de pagamento enviada para a fila RabbitMQ',
      });
    });
  });

  describe('HTTP Status Codes', () => {
    it('should return 201 status for successful charge creation', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
      };

      const expectedResponse: ChargeResponseDto = {
        charge_id: 'test-uuid',
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        payment_method: PaymentMethod.PIX,
        pix_key: 'pix-abc123',
        expiration_date: new Date(),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
      };

      mockChargesService.createCharge.mockResolvedValue(expectedResponse);

      const result = await controller.createCharge(createChargeDto);

      expect(result).toBeDefined();
      expect(result.charge_id).toBe('test-uuid');
    });

    it('should return 200 status for successful charge retrieval', async () => {
      const chargeId = 'test-uuid';
      const expectedResponse: ChargeResponseDto = {
        charge_id: chargeId,
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        customer_id: '123e4567-e89b-12d3-a456-426614174000',
        payment_method: PaymentMethod.PIX,
        pix_key: 'pix-abc123',
        expiration_date: new Date(),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
      };

      mockChargesService.getChargeById.mockResolvedValue(expectedResponse);

      const result = await controller.getCharge(chargeId);

      expect(result).toBeDefined();
      expect(result.charge_id).toBe(chargeId);
    });

    it('should return 200 status for successful payment simulation', async () => {
      const simulatePaymentDto: SimulatePaymentDto = {
        charge_id: 'test-uuid',
      };

      mockRabbitMQService.sendPaymentNotification.mockResolvedValue(undefined);

      const result = await controller.simulatePayment(simulatePaymentDto);

      expect(result).toBeDefined();
      expect(result.message).toContain('Notificação de pagamento enviada');
    });
  });
});
