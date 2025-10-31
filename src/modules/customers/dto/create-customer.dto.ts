import {
  IsString,
  IsNotEmpty,
  IsEmail,
  IsOptional,
  Length,
  Matches,
} from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCustomerDto {
  @ApiProperty({
    description: 'Nome do cliente',
    example: 'João Silva',
  })
  @IsString()
  @IsNotEmpty()
  @Length(2, 255)
  name: string;

  @ApiProperty({
    description: 'E-mail do cliente',
    example: 'joao@email.com',
  })
  @IsEmail({}, { message: 'E-mail deve ter um formato válido' })
  @IsNotEmpty()
  email: string;

  @ApiProperty({
    description: 'CPF ou CNPJ do cliente',
    example: '12345678901',
  })
  @IsString()
  @IsNotEmpty()
  @Matches(/^\d{11}$|^\d{14}$/, {
    message: 'Documento deve ser um CPF (11 dígitos) ou CNPJ (14 dígitos)',
  })
  document: string;

  @ApiProperty({
    description: 'Telefone do cliente',
    example: '11999999999',
    required: false,
  })
  @IsString()
  @IsOptional()
  @Matches(/^\d{10,11}$/, {
    message: 'Telefone deve ter 10 ou 11 dígitos',
  })
  phone?: string;
}
