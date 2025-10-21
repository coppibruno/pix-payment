import { validate } from 'class-validator';
import { CreateChargeDto } from './create-charge.dto';

describe('CreateChargeDto', () => {
  let dto: CreateChargeDto;

  beforeEach(() => {
    dto = new CreateChargeDto();
  });

  describe('payer_name', () => {
    it('should pass validation with valid payer name', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(0);
    });

    it('should fail validation with empty payer name', async () => {
      dto.payer_name = '';
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(1);
      expect(payerNameErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with payer name too short', async () => {
      dto.payer_name = 'A';
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(1);
      expect(payerNameErrors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail validation with payer name too long', async () => {
      dto.payer_name = 'A'.repeat(256);
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(1);
      expect(payerNameErrors[0].constraints).toHaveProperty('isLength');
    });

    it('should fail validation with non-string payer name', async () => {
      dto.payer_name = 123 as any;
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(1);
      expect(payerNameErrors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('payer_document', () => {
    it('should pass validation with valid CPF', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(0);
    });

    it('should pass validation with valid CNPJ', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901234';
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(0);
    });

    it('should fail validation with invalid document length', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '123456789'; // 9 digits
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(1);
      expect(documentErrors[0].constraints).toHaveProperty('matches');
    });

    it('should fail validation with document containing letters', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '1234567890a';
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(1);
      expect(documentErrors[0].constraints).toHaveProperty('matches');
    });

    it('should fail validation with empty document', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '';
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(1);
      expect(documentErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string document', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = 12345678901 as any;
      dto.amount = 10000;

      const errors = await validate(dto);
      const documentErrors = errors.filter(
        (error) => error.property === 'payer_document',
      );

      expect(documentErrors).toHaveLength(1);
      expect(documentErrors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('amount', () => {
    it('should pass validation with valid positive amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(0);
    });

    it('should fail validation with negative amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = -1000;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(1);
      expect(amountErrors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail validation with zero amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 0;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(1);
      expect(amountErrors[0].constraints).toHaveProperty('isPositive');
    });

    it('should fail validation with non-number amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = '10000' as any;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(1);
      expect(amountErrors[0].constraints).toHaveProperty('isNumber');
    });

    it('should pass validation with decimal amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 100.5;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(0);
    });
  });

  describe('description', () => {
    it('should pass validation with valid description', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      dto.description = 'Pagamento de serviços';

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(
        (error) => error.property === 'description',
      );

      expect(descriptionErrors).toHaveLength(0);
    });

    it('should pass validation without description (optional field)', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      // description is undefined

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(
        (error) => error.property === 'description',
      );

      expect(descriptionErrors).toHaveLength(0);
    });

    it('should pass validation with empty description', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      dto.description = '';

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(
        (error) => error.property === 'description',
      );

      expect(descriptionErrors).toHaveLength(0);
    });

    it('should fail validation with non-string description', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      dto.description = 123 as any;

      const errors = await validate(dto);
      const descriptionErrors = errors.filter(
        (error) => error.property === 'description',
      );

      expect(descriptionErrors).toHaveLength(1);
      expect(descriptionErrors[0].constraints).toHaveProperty('isString');
    });
  });

  describe('complete validation', () => {
    it('should pass validation with all valid fields', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      dto.description = 'Pagamento de serviços';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should fail validation with multiple invalid fields', async () => {
      dto.payer_name = ''; // invalid
      dto.payer_document = '123'; // invalid
      dto.amount = -1000; // invalid
      dto.description = 123 as any; // invalid

      const errors = await validate(dto);

      expect(errors).toHaveLength(4);
      expect(errors.map((error) => error.property)).toContain('payer_name');
      expect(errors.map((error) => error.property)).toContain('payer_document');
      expect(errors.map((error) => error.property)).toContain('amount');
      expect(errors.map((error) => error.property)).toContain('description');
    });

    it('should pass validation with minimum required fields', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 10000;
      // description is optional

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });
  });

  describe('edge cases', () => {
    it('should handle very long valid payer name', async () => {
      dto.payer_name = 'A'.repeat(255); // maximum length
      dto.payer_document = '12345678901';
      dto.amount = 10000;

      const errors = await validate(dto);
      const payerNameErrors = errors.filter(
        (error) => error.property === 'payer_name',
      );

      expect(payerNameErrors).toHaveLength(0);
    });

    it('should handle very large amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = Number.MAX_SAFE_INTEGER;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(0);
    });

    it('should handle very small positive amount', async () => {
      dto.payer_name = 'João Silva';
      dto.payer_document = '12345678901';
      dto.amount = 0.01;

      const errors = await validate(dto);
      const amountErrors = errors.filter(
        (error) => error.property === 'amount',
      );

      expect(amountErrors).toHaveLength(0);
    });
  });
});
