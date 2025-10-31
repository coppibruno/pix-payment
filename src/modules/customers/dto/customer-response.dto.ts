import { ApiProperty } from '@nestjs/swagger';

export class CustomerResponseDto {
  @ApiProperty({ description: 'ID do cliente' })
  id: string;

  @ApiProperty({ description: 'Nome do cliente' })
  name: string;

  @ApiProperty({ description: 'E-mail do cliente' })
  email: string;

  @ApiProperty({ description: 'Documento do cliente' })
  document: string;

  @ApiProperty({ description: 'Telefone do cliente', required: false })
  phone?: string;

  @ApiProperty({ description: 'Data de criação' })
  created_at: Date;

  @ApiProperty({ description: 'Data de atualização' })
  updated_at: Date;
}
