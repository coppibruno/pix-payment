import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Charge, ChargeStatus } from '../../database/entities/charge.entity';
import { CreateChargeDto } from './dto/create-charge.dto';
import { ChargeResponseDto } from './dto/charge-response.dto';

@Injectable()
export class ChargesService {
  constructor(
    @InjectRepository(Charge)
    private chargesRepository: Repository<Charge>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createCharge(
    createChargeDto: CreateChargeDto,
  ): Promise<ChargeResponseDto> {
    const charge = new Charge();
    charge.id = uuidv4();
    charge.payer_name = createChargeDto.payer_name;
    charge.payer_document = createChargeDto.payer_document;
    charge.amount = createChargeDto.amount;
    charge.description = createChargeDto.description;
    charge.pix_key = this.generatePixKey();
    charge.expiration_date = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 horas
    charge.status = ChargeStatus.PENDING;

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

  private mapToResponseDto(charge: Charge): ChargeResponseDto {
    return {
      charge_id: charge.id,
      payer_name: charge.payer_name,
      payer_document: charge.payer_document,
      amount: charge.amount,
      description: charge.description,
      pix_key: charge.pix_key,
      expiration_date: charge.expiration_date,
      status: charge.status,
      created_at: charge.created_at,
    };
  }
}
