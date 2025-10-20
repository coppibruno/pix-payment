import {
  Controller,
  Get,
  Post,
  Body,
  Param,
  HttpCode,
  HttpStatus,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiParam } from '@nestjs/swagger';
import { ChargesService } from './charges.service';
import { RabbitMQService } from '../notifications/rabbitmq.service';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ChargeResponseDto } from './dto/charge-response.dto';
import { SimulatePaymentDto } from './dto/simulate-payment.dto';

@ApiTags('charges')
@Controller('charges')
export class ChargesController {
  constructor(
    private readonly chargesService: ChargesService,
    private readonly rabbitMQService: RabbitMQService,
  ) {}

  @Post()
  @ApiOperation({ summary: 'Criar nova cobrança Pix' })
  @ApiResponse({
    status: 201,
    description: 'Cobrança criada com sucesso',
    type: ChargeResponseDto,
  })
  @ApiResponse({ status: 400, description: 'Dados inválidos' })
  async createCharge(
    @Body() createChargeDto: CreateChargeDto,
  ): Promise<ChargeResponseDto> {
    return this.chargesService.createCharge(createChargeDto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Consultar cobrança por ID' })
  @ApiParam({ name: 'id', description: 'ID da cobrança' })
  @ApiResponse({
    status: 200,
    description: 'Cobrança encontrada',
    type: ChargeResponseDto,
  })
  @ApiResponse({ status: 404, description: 'Cobrança não encontrada' })
  async getCharge(@Param('id') id: string): Promise<ChargeResponseDto> {
    return this.chargesService.getChargeById(id);
  }

  @Post('simulate-payment')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Simular notificação de pagamento' })
  @ApiResponse({
    status: 200,
    description: 'Notificação de pagamento enviada para a fila',
  })
  @ApiResponse({ status: 404, description: 'Cobrança não encontrada' })
  async simulatePayment(
    @Body() simulatePaymentDto: SimulatePaymentDto,
  ): Promise<{ message: string }> {
    // Envia mensagem para o RabbitMQ
    await this.rabbitMQService.sendPaymentNotification(
      simulatePaymentDto.charge_id,
    );
    return { message: 'Notificação de pagamento enviada para a fila RabbitMQ' };
  }
}
