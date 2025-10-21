import { Test, TestingModule } from '@nestjs/testing';
import { getRepositoryToken } from '@nestjs/typeorm';
// Mock do Redis
const getRedisToken = () => 'REDIS_TOKEN';
import { NotFoundException } from '@nestjs/common';
import { ChargesService } from './charges.service';
import { Charge, ChargeStatus } from '../../database/entities/charge.entity';
import { CreateChargeDto } from './dto/create-charge.dto';

describe('ChargesService', () => {
  let service: ChargesService;

  const mockRepository = {
    save: jest.fn(),
    findOne: jest.fn(),
  };

  const mockRedis = {
    get: jest.fn(),
    setex: jest.fn(),
    del: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ChargesService,
        {
          provide: getRepositoryToken(Charge),
          useValue: mockRepository,
        },
        {
          provide: getRedisToken(),
          useValue: mockRedis,
        },
      ],
    }).compile();

    service = module.get<ChargesService>(ChargesService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe('createCharge', () => {
    it('should create a new charge successfully', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
      };

      const mockCharge = {
        id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        pix_key: 'pix-abc123',
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.save.mockResolvedValue(mockCharge);

      const result = await service.createCharge(createChargeDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          payer_name: 'João Silva',
          payer_document: '12345678901',
          amount: 10000,
          description: 'Pagamento de serviços',
          status: ChargeStatus.PENDING,
        }),
      );

      expect(result).toEqual({
        charge_id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        pix_key: 'pix-abc123',
        expiration_date: expect.any(Date),
        status: ChargeStatus.PENDING,
        created_at: expect.any(Date),
      });
    });

    it('should create a charge without description', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'Maria Santos',
        payer_document: '98765432100',
        amount: 5000,
      };

      const mockCharge = {
        id: 'test-uuid-2',
        payer_name: 'Maria Santos',
        payer_document: '98765432100',
        amount: 5000,
        description: undefined,
        pix_key: 'pix-def456',
        expiration_date: new Date(Date.now() + 24 * 60 * 60 * 1000),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.save.mockResolvedValue(mockCharge);

      const result = await service.createCharge(createChargeDto);

      expect(result.description).toBeUndefined();
      expect(result.amount).toBe(5000);
    });
  });

  describe('getChargeById', () => {
    it('should return charge from cache when available', async () => {
      const chargeId = 'test-uuid';
      const cachedCharge = {
        charge_id: chargeId,
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        status: ChargeStatus.PENDING,
      };

      mockRedis.get.mockResolvedValue(JSON.stringify(cachedCharge));

      const result = await service.getChargeById(chargeId);

      expect(mockRedis.get).toHaveBeenCalledWith(`charge:${chargeId}`);
      expect(mockRepository.findOne).not.toHaveBeenCalled();
      expect(result).toEqual(cachedCharge);
    });

    it('should return charge from database when not in cache', async () => {
      const chargeId = 'test-uuid';
      const mockCharge = {
        id: chargeId,
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        pix_key: 'pix-abc123',
        expiration_date: new Date(),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(mockCharge);
      mockRedis.setex.mockResolvedValue('OK');

      const result = await service.getChargeById(chargeId);

      expect(mockRedis.get).toHaveBeenCalledWith(`charge:${chargeId}`);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: chargeId },
      });
      expect(mockRedis.setex).toHaveBeenCalledWith(
        `charge:${chargeId}`,
        300,
        JSON.stringify(
          expect.objectContaining({
            charge_id: chargeId,
            payer_name: 'João Silva',
          }),
        ),
      );
      expect(result.charge_id).toBe(chargeId);
    });

    it('should throw NotFoundException when charge not found', async () => {
      const chargeId = 'non-existent-uuid';

      mockRedis.get.mockResolvedValue(null);
      mockRepository.findOne.mockResolvedValue(null);

      await expect(service.getChargeById(chargeId)).rejects.toThrow(
        NotFoundException,
      );
      expect(mockRedis.get).toHaveBeenCalledWith(`charge:${chargeId}`);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: chargeId },
      });
    });
  });

  describe('updateChargeStatus', () => {
    it('should update charge status successfully', async () => {
      const chargeId = 'test-uuid';
      const newStatus = ChargeStatus.PAID;
      const mockCharge = {
        id: chargeId,
        payer_name: 'João Silva',
        status: ChargeStatus.PENDING,
      };

      const updatedCharge = {
        ...mockCharge,
        status: newStatus,
      };

      mockRepository.findOne.mockResolvedValue(mockCharge);
      mockRepository.save.mockResolvedValue(updatedCharge);
      mockRedis.del.mockResolvedValue(1);

      const result = await service.updateChargeStatus(chargeId, newStatus);

      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: chargeId },
      });
      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          status: newStatus,
        }),
      );
      expect(mockRedis.del).toHaveBeenCalledWith(`charge:${chargeId}`);
      expect(result.status).toBe(newStatus);
    });

    it('should throw NotFoundException when charge not found for update', async () => {
      const chargeId = 'non-existent-uuid';
      const newStatus = ChargeStatus.PAID;

      mockRepository.findOne.mockResolvedValue(null);

      await expect(
        service.updateChargeStatus(chargeId, newStatus),
      ).rejects.toThrow(NotFoundException);
      expect(mockRepository.findOne).toHaveBeenCalledWith({
        where: { id: chargeId },
      });
      expect(mockRepository.save).not.toHaveBeenCalled();
    });
  });

  describe('generatePixKey', () => {
    it('should generate a valid PIX key', () => {
      // Testa o método privado através do comportamento público
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
      };

      const mockCharge = {
        id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        pix_key: 'pix-abc123',
        expiration_date: new Date(),
        status: ChargeStatus.PENDING,
        created_at: new Date(),
        updated_at: new Date(),
      };

      mockRepository.save.mockResolvedValue(mockCharge);

      service.createCharge(createChargeDto);

      expect(mockRepository.save).toHaveBeenCalledWith(
        expect.objectContaining({
          pix_key: expect.stringMatching(/^pix-/),
        }),
      );
    });
  });

  describe('mapToResponseDto', () => {
    it('should map charge entity to response DTO correctly', async () => {
      const createChargeDto: CreateChargeDto = {
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
      };

      const mockCharge = {
        id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        pix_key: 'pix-abc123',
        expiration_date: new Date('2024-01-02T10:00:00.000Z'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
        updated_at: new Date('2024-01-01T10:00:00.000Z'),
      };

      mockRepository.save.mockResolvedValue(mockCharge);

      const result = await service.createCharge(createChargeDto);

      expect(result).toEqual({
        charge_id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        description: 'Pagamento de serviços',
        pix_key: 'pix-abc123',
        expiration_date: new Date('2024-01-02T10:00:00.000Z'),
        status: ChargeStatus.PENDING,
        created_at: new Date('2024-01-01T10:00:00.000Z'),
      });
    });
  });
});
