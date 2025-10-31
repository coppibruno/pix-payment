import {
  Injectable,
  NotFoundException,
  ConflictException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { InjectRedis } from '@nestjs-modules/ioredis';
import { Repository } from 'typeorm';
import { Redis } from 'ioredis';
import { v4 as uuidv4 } from 'uuid';
import { Customer } from '../../database/entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { CustomerResponseDto } from './dto/customer-response.dto';

@Injectable()
export class CustomersService {
  constructor(
    @InjectRepository(Customer)
    private customersRepository: Repository<Customer>,
    @InjectRedis() private readonly redis: Redis,
  ) {}

  async createCustomer(
    createCustomerDto: CreateCustomerDto,
  ): Promise<CustomerResponseDto> {
    // Verifica se já existe um cliente com o mesmo e-mail
    const existingCustomerByEmail = await this.customersRepository.findOne({
      where: { email: createCustomerDto.email },
    });

    if (existingCustomerByEmail) {
      throw new ConflictException('Já existe um cliente com este e-mail');
    }

    // Verifica se já existe um cliente com o mesmo documento
    const existingCustomerByDocument = await this.customersRepository.findOne({
      where: { document: createCustomerDto.document },
    });

    if (existingCustomerByDocument) {
      throw new ConflictException('Já existe um cliente com este documento');
    }

    const customer = new Customer();
    customer.id = uuidv4();
    customer.name = createCustomerDto.name;
    customer.email = createCustomerDto.email;
    customer.document = createCustomerDto.document;
    customer.phone = createCustomerDto.phone;

    const savedCustomer = await this.customersRepository.save(customer);

    return this.mapToResponseDto(savedCustomer);
  }

  async getAllCustomers(): Promise<CustomerResponseDto[]> {
    const customers = await this.customersRepository.find({
      order: { created_at: 'DESC' },
    });

    return customers.map((customer) => this.mapToResponseDto(customer));
  }

  async getCustomerById(id: string): Promise<CustomerResponseDto> {
    const cacheKey = `customer:${id}`;

    // Tenta buscar do cache primeiro
    const cachedCustomer = await this.redis.get(cacheKey);
    if (cachedCustomer) {
      return JSON.parse(cachedCustomer);
    }

    // Se não estiver no cache, busca no banco
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    const responseDto = this.mapToResponseDto(customer);

    // Salva no cache por 5 minutos
    await this.redis.setex(cacheKey, 300, JSON.stringify(responseDto));

    return responseDto;
  }

  async updateCustomer(
    id: string,
    updateCustomerDto: UpdateCustomerDto,
  ): Promise<CustomerResponseDto> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    // Verifica se o novo e-mail já existe em outro cliente
    if (updateCustomerDto.email && updateCustomerDto.email !== customer.email) {
      const existingCustomerByEmail = await this.customersRepository.findOne({
        where: { email: updateCustomerDto.email },
      });

      if (existingCustomerByEmail) {
        throw new ConflictException('Já existe um cliente com este e-mail');
      }
    }

    // Verifica se o novo documento já existe em outro cliente
    if (
      updateCustomerDto.document &&
      updateCustomerDto.document !== customer.document
    ) {
      const existingCustomerByDocument = await this.customersRepository.findOne(
        {
          where: { document: updateCustomerDto.document },
        },
      );

      if (existingCustomerByDocument) {
        throw new ConflictException('Já existe um cliente com este documento');
      }
    }

    // Atualiza os campos fornecidos
    Object.assign(customer, updateCustomerDto);

    const updatedCustomer = await this.customersRepository.save(customer);

    // Invalida o cache quando o cliente é atualizado
    const cacheKey = `customer:${id}`;
    await this.redis.del(cacheKey);

    return this.mapToResponseDto(updatedCustomer);
  }

  async deleteCustomer(id: string): Promise<void> {
    const customer = await this.customersRepository.findOne({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException('Cliente não encontrado');
    }

    await this.customersRepository.remove(customer);

    // Invalida o cache quando o cliente é removido
    const cacheKey = `customer:${id}`;
    await this.redis.del(cacheKey);
  }

  private mapToResponseDto(customer: Customer): CustomerResponseDto {
    return {
      id: customer.id,
      name: customer.name,
      email: customer.email,
      document: customer.document,
      phone: customer.phone,
      created_at: customer.created_at,
      updated_at: customer.updated_at,
    };
  }
}
