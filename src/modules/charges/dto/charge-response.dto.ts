import { ApiProperty } from '@nestjs/swagger';
import {
  ChargeStatus,
  PaymentMethod,
} from '../../../database/entities/charge.entity';

export class ChargeResponseDto {
  @ApiProperty({ description: 'ID da cobrança' })
  charge_id: string;

  @ApiProperty({ description: 'ID do cliente' })
  customer_id: string;

  @ApiProperty({
    description: 'Método de pagamento',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @ApiProperty({
    description: 'Chave Pix para pagamento (apenas para PIX)',
    required: false,
  })
  pix_key?: string;

  @ApiProperty({
    description: 'Data de expiração (apenas para PIX)',
    required: false,
  })
  expiration_date?: Date;

  // Campos específicos para Cartão de Crédito
  @ApiProperty({
    description: 'Número do cartão mascarado (apenas para cartão)',
    required: false,
  })
  card_number?: string;

  @ApiProperty({
    description: 'Nome do portador do cartão (apenas para cartão)',
    required: false,
  })
  card_holder_name?: string;

  @ApiProperty({
    description: 'Número de parcelas (apenas para cartão)',
    required: false,
  })
  installments?: number;

  // Campos específicos para Boleto
  @ApiProperty({
    description: 'Código do boleto (apenas para boleto)',
    required: false,
  })
  bank_slip_code?: string;

  @ApiProperty({
    description: 'URL do boleto (apenas para boleto)',
    required: false,
  })
  bank_slip_url?: string;

  @ApiProperty({
    description: 'Data de vencimento do boleto (apenas para boleto)',
    required: false,
  })
  due_date?: Date;

  @ApiProperty({
    description: 'Status da cobrança',
    enum: ChargeStatus,
    example: ChargeStatus.PENDING,
  })
  status: ChargeStatus;

  @ApiProperty({ description: 'Nome do pagador' })
  payer_name: string;

  @ApiProperty({ description: 'Documento do pagador' })
  payer_document: string;

  @ApiProperty({ description: 'Valor em centavos' })
  amount: number;

  @ApiProperty({ description: 'Descrição da cobrança' })
  description?: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at: Date;
}
