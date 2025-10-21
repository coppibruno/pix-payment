import { validate } from 'class-validator';
import { SimulatePaymentDto } from './simulate-payment.dto';

describe('SimulatePaymentDto', () => {
  let dto: SimulatePaymentDto;

  beforeEach(() => {
    dto = new SimulatePaymentDto();
  });

  describe('charge_id', () => {
    it('should pass validation with valid UUID', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(0);
    });

    it('should pass validation with valid string ID', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(0);
    });

    it('should fail validation with empty charge_id', async () => {
      dto.charge_id = '';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(1);
      expect(chargeIdErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with undefined charge_id', async () => {
      dto.charge_id = undefined as any;

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(1);
      expect(chargeIdErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with null charge_id', async () => {
      dto.charge_id = null as any;

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(1);
      expect(chargeIdErrors[0].constraints).toHaveProperty('isNotEmpty');
    });

    it('should fail validation with non-string charge_id', async () => {
      dto.charge_id = 123 as any;

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(1);
      expect(chargeIdErrors[0].constraints).toHaveProperty('isString');
    });

    it('should fail validation with whitespace-only charge_id', async () => {
      dto.charge_id = '   ';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(1);
      expect(chargeIdErrors[0].constraints).toHaveProperty('isNotEmpty');
    });
  });

  describe('complete validation', () => {
    it('should pass validation with valid charge_id', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);

      expect(errors).toHaveLength(0);
    });

    it('should pass validation with different valid charge_id formats', async () => {
      const validIds = [
        '123e4567-e89b-12d3-a456-426614174000',
        '987fcdeb-51a2-43d1-9f12-123456789abc',
        '00000000-0000-0000-0000-000000000000',
      ];

      for (const id of validIds) {
        dto.charge_id = id;
        const errors = await validate(dto);
        expect(errors).toHaveLength(0);
      }
    });
  });

  describe('edge cases', () => {
    it('should handle very long charge_id', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(0);
    });

    it('should handle charge_id with special characters', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(0);
    });

    it('should handle charge_id with numbers only', async () => {
      dto.charge_id = '123e4567-e89b-12d3-a456-426614174000';

      const errors = await validate(dto);
      const chargeIdErrors = errors.filter(
        (error) => error.property === 'charge_id',
      );

      expect(chargeIdErrors).toHaveLength(0);
    });
  });
});
