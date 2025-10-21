import {
  IsString,
  IsNotEmpty,
  IsNumber,
  IsPositive,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

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
}
