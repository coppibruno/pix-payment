import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import {
  Charge,
  ChargeStatus,
  PaymentMethod,
} from '../../database/entities/charge.entity';
import { Customer } from '../../database/entities/customer.entity';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ChargeResponseDto } from './dto/charge-response.dto';

@Injectable()
export class ChargesService {
  constructor(
    @InjectRepository(Charge)
    private chargesRepository: Repository<Charge>,
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createCharge(
    createChargeDto: CreateChargeDto,
  ): Promise<ChargeResponseDto> {
    // Verifica se o cliente existe
    const customer = await this.customersRepository.findOne({
      where: { id: createChargeDto.customer_id },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const charge = new Charge();
    charge.id = uuidv4();
    charge.customer = customer;
    charge.payer_name = createChargeDto.payer_name;
    charge.payer_document = createChargeDto.payer_document;
    charge.amount = createChargeDto.amount;
    charge.description = createChargeDto.description;
    charge.payment_method = createChargeDto.payment_method;
    charge.status = ChargeStatus.PENDING;

    // Configuração específica por método de pagamento
    switch (createChargeDto.payment_method) {
      case PaymentMethod.PIX:
        charge.pix_key = this.generatePixKey();
        charge.expiration_date = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
        break;

      case PaymentMethod.CREDIT_CARD:
        charge.card_number = this.maskCardNumber(createChargeDto.card_number);
        charge.card_expiry = createChargeDto.card_expiry;
        charge.card_cvv = createChargeDto.card_cvv;
        charge.card_holder_name = createChargeDto.card_holder_name;
        charge.installments = createChargeDto.installments || 1;
        break;

      case PaymentMethod.BANK_SLIP:
        charge.bank_slip_code = this.generateBankSlipCode();
        charge.bank_slip_url = this.generateBankSlipUrl(charge.id);
        charge.due_date = createChargeDto.due_date
          ? new Date(createChargeDto.due_date)
          : new Date(Date.now() + 3 * 24 * 60 * 60 * 1000); // 3 dias
        break;
    }

    const savedCharge = await this.chargesRepository.save(charge);

    return this.mapToResponseDto(savedCharge);
  }

  async getChargeById(id: string): Promise<ChargeResponseDto> {
    const cacheKey = `charge:${id}`;

    // Tenta buscar do cache primeiro
    const cachedCharge = await this.redis.get(cacheKey);
    if (cachedCharge) {
      return JSON.parse(cachedCharge);
    }

    // Se não estiver no cache, busca no banco
    const charge = await this.chargesRepository.findOne({ where: { id } });
    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    const responseDto = this.mapToResponseDto(charge);

    // Salva no cache por 5 minutos
    await this.redis.setex(cacheKey, 300, JSON.stringify(responseDto));

    return responseDto;
  }

  async updateChargeStatus(id: string, status: ChargeStatus): Promise<Charge> {
    const charge = await this.chargesRepository.findOne({ where: { id } });
    if (!charge) {
      throw new NotFoundException('Cobrança não encontrada');
    }

    charge.status = status;
    const updatedCharge = await this.chargesRepository.save(charge);

    // Invalida o cache quando o status é atualizado
    const cacheKey = `charge:${id}`;
    await this.redis.del(cacheKey);

    return updatedCharge;
  }

  private generatePixKey(): string {
    // Gera uma chave Pix aleatória (formato simplificado)
    const randomKey = Math.random().toString(36).substring(2, 15);
    return `pix-${randomKey}`;
  }

  private maskCardNumber(cardNumber: string): string {
    // Mascara o número do cartão, mostrando apenas os últimos 4 dígitos
    const lastFour = cardNumber.slice(-4);
    const masked = '*'.repeat(cardNumber.length - 4);
    return `${masked}${lastFour}`;
  }

  private generateBankSlipCode(): string {
    // Gera código de barras do boleto (formato simplificado)
    const randomCode = Math.random().toString().substring(2, 47);
    return randomCode.padEnd(47, '0');
  }

  private generateBankSlipUrl(chargeId: string): string {
    // Gera URL do boleto (simulado)
    return `https://boleto.example.com/${chargeId}`;
  }

  private mapToResponseDto(charge: Charge): ChargeResponseDto {
    const response: ChargeResponseDto = {
      charge_id: charge.id,
      customer_id: charge.customer?.id || '',
      payer_name: charge.payer_name,
      payer_document: charge.payer_document,
      amount: charge.amount,
      description: charge.description,
      payment_method: charge.payment_method,
      status: charge.status,
      created_at: charge.created_at,
    };

    // Adiciona campos específicos baseados no método de pagamento
    switch (charge.payment_method) {
      case PaymentMethod.PIX:
        response.pix_key = charge.pix_key;
        response.expiration_date = charge.expiration_date;
        break;

      case PaymentMethod.CREDIT_CARD:
        response.card_number = charge.card_number;
        response.card_holder_name = charge.card_holder_name;
        response.installments = charge.installments;
        break;

      case PaymentMethod.BANK_SLIP:
        response.bank_slip_code = charge.bank_slip_code;
        response.bank_slip_url = charge.bank_slip_url;
        response.due_date = charge.due_date;
        break;
    }

    return response;
  }
}
