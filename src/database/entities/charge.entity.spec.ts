import { Charge, ChargeStatus } from './charge.entity';

describe('Charge Entity', () => {
  let charge: Charge;

  beforeEach(() => {
    charge = new Charge();
  });

  describe('Entity Properties', () => {
    it('should have all required properties', () => {
      // As propriedades são definidas pelos decorators do TypeORM
      // Vamos testar se podemos definir valores para elas
      charge.id = 'test-id';
      charge.payer_name = 'João Silva';
      charge.payer_document = '12345678901';
      charge.amount = 10000;
      charge.description = 'Test';
      charge.pix_key = 'pix-123';
      charge.expiration_date = new Date();
      charge.status = ChargeStatus.PENDING;
      charge.created_at = new Date();
      charge.updated_at = new Date();

      expect(charge.id).toBe('test-id');
      expect(charge.payer_name).toBe('João Silva');
      expect(charge.payer_document).toBe('12345678901');
      expect(charge.amount).toBe(10000);
      expect(charge.description).toBe('Test');
      expect(charge.pix_key).toBe('pix-123');
      expect(charge.expiration_date).toBeInstanceOf(Date);
      expect(charge.status).toBe(ChargeStatus.PENDING);
      expect(charge.created_at).toBeInstanceOf(Date);
      expect(charge.updated_at).toBeInstanceOf(Date);
    });

    it('should allow setting and getting properties', () => {
      const testData = {
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

      Object.assign(charge, testData);

      expect(charge.id).toBe(testData.id);
      expect(charge.payer_name).toBe(testData.payer_name);
      expect(charge.payer_document).toBe(testData.payer_document);
      expect(charge.amount).toBe(testData.amount);
      expect(charge.description).toBe(testData.description);
      expect(charge.pix_key).toBe(testData.pix_key);
      expect(charge.expiration_date).toBe(testData.expiration_date);
      expect(charge.status).toBe(testData.status);
      expect(charge.created_at).toBe(testData.created_at);
      expect(charge.updated_at).toBe(testData.updated_at);
    });
  });

  describe('ChargeStatus Enum', () => {
    it('should have all required status values', () => {
      expect(ChargeStatus.PENDING).toBe('pending');
      expect(ChargeStatus.PAID).toBe('paid');
      expect(ChargeStatus.EXPIRED).toBe('expired');
      expect(ChargeStatus.CANCELLED).toBe('cancelled');
    });

    it('should allow setting valid status values', () => {
      const statuses = [
        ChargeStatus.PENDING,
        ChargeStatus.PAID,
        ChargeStatus.EXPIRED,
        ChargeStatus.CANCELLED,
      ];

      statuses.forEach((status) => {
        charge.status = status;
        expect(charge.status).toBe(status);
      });
    });
  });

  describe('Entity Creation', () => {
    it('should create a new charge instance', () => {
      expect(charge).toBeInstanceOf(Charge);
    });

    it('should have undefined properties by default', () => {
      expect(charge.id).toBeUndefined();
      expect(charge.payer_name).toBeUndefined();
      expect(charge.payer_document).toBeUndefined();
      expect(charge.amount).toBeUndefined();
      expect(charge.description).toBeUndefined();
      expect(charge.pix_key).toBeUndefined();
      expect(charge.expiration_date).toBeUndefined();
      expect(charge.status).toBeUndefined();
      expect(charge.created_at).toBeUndefined();
      expect(charge.updated_at).toBeUndefined();
    });
  });

  describe('Data Types', () => {
    it('should accept string values for text fields', () => {
      charge.payer_name = 'João Silva';
      charge.payer_document = '12345678901';
      charge.description = 'Pagamento de serviços';
      charge.pix_key = 'pix-abc123';

      expect(typeof charge.payer_name).toBe('string');
      expect(typeof charge.payer_document).toBe('string');
      expect(typeof charge.description).toBe('string');
      expect(typeof charge.pix_key).toBe('string');
    });

    it('should accept number values for amount', () => {
      charge.amount = 10000;
      expect(typeof charge.amount).toBe('number');
      expect(charge.amount).toBe(10000);
    });

    it('should accept Date values for date fields', () => {
      const now = new Date();
      charge.expiration_date = now;
      charge.created_at = now;
      charge.updated_at = now;

      expect(charge.expiration_date).toBeInstanceOf(Date);
      expect(charge.created_at).toBeInstanceOf(Date);
      expect(charge.updated_at).toBeInstanceOf(Date);
    });

    it('should accept enum values for status', () => {
      charge.status = ChargeStatus.PENDING;
      expect(charge.status).toBe(ChargeStatus.PENDING);
      expect(typeof charge.status).toBe('string');
    });
  });

  describe('Edge Cases', () => {
    it('should handle null values for optional fields', () => {
      charge.description = null as any;
      expect(charge.description).toBeNull();
    });

    it('should handle undefined values', () => {
      charge.payer_name = undefined as any;
      expect(charge.payer_name).toBeUndefined();
    });

    it('should handle empty strings', () => {
      charge.payer_name = '';
      charge.payer_document = '';
      charge.description = '';
      charge.pix_key = '';

      expect(charge.payer_name).toBe('');
      expect(charge.payer_document).toBe('');
      expect(charge.description).toBe('');
      expect(charge.pix_key).toBe('');
    });

    it('should handle very large numbers for amount', () => {
      charge.amount = Number.MAX_SAFE_INTEGER;
      expect(charge.amount).toBe(Number.MAX_SAFE_INTEGER);
    });

    it('should handle decimal numbers for amount', () => {
      charge.amount = 100.5;
      expect(charge.amount).toBe(100.5);
    });

    it('should handle negative numbers for amount', () => {
      charge.amount = -1000;
      expect(charge.amount).toBe(-1000);
    });
  });

  describe('Entity Relationships', () => {
    it('should maintain data integrity when updating properties', () => {
      const originalData = {
        id: 'test-uuid',
        payer_name: 'João Silva',
        payer_document: '12345678901',
        amount: 10000,
        status: ChargeStatus.PENDING,
      };

      Object.assign(charge, originalData);

      // Update some properties
      charge.payer_name = 'Maria Santos';
      charge.status = ChargeStatus.PAID;

      expect(charge.id).toBe(originalData.id);
      expect(charge.payer_document).toBe(originalData.payer_document);
      expect(charge.amount).toBe(originalData.amount);
      expect(charge.payer_name).toBe('Maria Santos');
      expect(charge.status).toBe(ChargeStatus.PAID);
    });
  });

  describe('Validation Scenarios', () => {
    it('should handle valid business scenarios', () => {
      const validCharge = {
        id: '123e4567-e89b-12d3-a456-426614174000',
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

      Object.assign(charge, validCharge);

      expect(charge.id).toBe(validCharge.id);
      expect(charge.payer_name).toBe(validCharge.payer_name);
      expect(charge.payer_document).toBe(validCharge.payer_document);
      expect(charge.amount).toBe(validCharge.amount);
      expect(charge.description).toBe(validCharge.description);
      expect(charge.pix_key).toBe(validCharge.pix_key);
      expect(charge.expiration_date).toBe(validCharge.expiration_date);
      expect(charge.status).toBe(validCharge.status);
      expect(charge.created_at).toBe(validCharge.created_at);
      expect(charge.updated_at).toBe(validCharge.updated_at);
    });

    it('should handle different status transitions', () => {
      charge.status = ChargeStatus.PENDING;
      expect(charge.status).toBe(ChargeStatus.PENDING);

      charge.status = ChargeStatus.PAID;
      expect(charge.status).toBe(ChargeStatus.PAID);

      charge.status = ChargeStatus.EXPIRED;
      expect(charge.status).toBe(ChargeStatus.EXPIRED);

      charge.status = ChargeStatus.CANCELLED;
      expect(charge.status).toBe(ChargeStatus.CANCELLED);
    });
  });

  describe('Entity Serialization', () => {
    it('should be serializable to JSON', () => {
      const testData = {
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

      Object.assign(charge, testData);

      const json = JSON.stringify(charge);
      const parsed = JSON.parse(json);

      expect(parsed.id).toBe(testData.id);
      expect(parsed.payer_name).toBe(testData.payer_name);
      expect(parsed.payer_document).toBe(testData.payer_document);
      expect(parsed.amount).toBe(testData.amount);
      expect(parsed.description).toBe(testData.description);
      expect(parsed.pix_key).toBe(testData.pix_key);
      expect(parsed.status).toBe(testData.status);
      expect(new Date(parsed.expiration_date)).toEqual(
        testData.expiration_date,
      );
      expect(new Date(parsed.created_at)).toEqual(testData.created_at);
      expect(new Date(parsed.updated_at)).toEqual(testData.updated_at);
    });
  });
});
