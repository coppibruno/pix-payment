import { ApiProperty } from '@nestjs/swagger';
import { ChargeStatus } from '../../../database/entities/charge.entity';

export class ChargeResponseDto {
  @ApiProperty({ description: 'ID da cobrança' })
  charge_id: string;

  @ApiProperty({ description: 'Chave Pix para pagamento' })
  pix_key: string;

  @ApiProperty({ description: 'Data de expiração' })
  expiration_date: Date;

  @ApiProperty({ 
    description: 'Status da cobrança',
    enum: ChargeStatus,
    example: ChargeStatus.PENDING
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
