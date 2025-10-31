import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Length,
  Matches,
  IsEnum,
  IsDateString,
  IsUUID,
  Min,
  Max,
  ValidateIf,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { PaymentMethod } from '../../../database/entities/charge.entity';

export class CreateChargeDto {
  @ApiProperty({
    description: 'Nome do pagador',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  payer_name: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do pagador',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)',
  })
  payer_document: string;

  @ApiProperty({
    description: 'Valor em centavos',
    example: 10000,
  })
  @IsNumber()
  @IsPositive()
  amount: number;

  @ApiProperty({
    description: 'Descrição da cobrança',
    example: 'Pagamento de serviços',
    required: false,
  })
  @IsString()
  @IsOptional()
  description?: string;

  @ApiProperty({
    description: 'ID do cliente',
    example: '123e4567-e89b-12d3-a456-426614174000',
  })
  @IsString()
  @IsNotEmpty()
  @IsUUID()
  customer_id: string;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
    example: PaymentMethod.PIX,
  })
  @IsEnum(PaymentMethod)
  payment_method: PaymentMethod;

  // Campos específicos para Cartão de Crédito
  @ApiProperty({
    description: 'Número do cartão (apenas para cartão de crédito)',
    example: '4111111111111111',
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.CREDIT_CARD)
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{13,19}$/, {
    message: 'Número do cartão deve ter entre 13 e 19 dígitos',
  })
  card_number?: string;

  @ApiProperty({
    description: 'Data de expiração do cartão (MM/YY)',
    example: '12/25',
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.CREDIT_CARD)
  @IsString()
  @IsNotEmpty()
  @Matches(/^(0[1-9]|1[0-2])\/\d{2}$/, {
    message: 'Data de expiração deve estar no formato MM/YY',
  })
  card_expiry?: string;

  @ApiProperty({
    description: 'CVV do cartão',
    example: '123',
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.CREDIT_CARD)
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{3,4}$/, {
    message: 'CVV deve ter 3 ou 4 dígitos',
  })
  card_cvv?: string;

  @ApiProperty({
    description: 'Nome do portador do cartão',
    example: 'João Silva',
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.CREDIT_CARD)
  @IsString()
  @IsNotEmpty()
  @Length(2, 100)
  card_holder_name?: string;

  @ApiProperty({
    description: 'Número de parcelas (apenas para cartão de crédito)',
    example: 1,
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.CREDIT_CARD)
  @IsNumber()
  @Min(1)
  @Max(12)
  installments?: number;

  // Campos específicos para Boleto
  @ApiProperty({
    description: 'Data de vencimento do boleto (apenas para boleto)',
    example: '2024-12-31',
    required: false,
  })
  @ValidateIf((o) => o.payment_method === PaymentMethod.BANK_SLIP)
  @IsDateString()
  due_date?: string;
}
