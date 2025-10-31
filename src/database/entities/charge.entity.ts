import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { Customer } from './customer.entity';

export enum ChargeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
  FAILED = 'failed',
}

export enum PaymentMethod {
  PIX = 'pix',
  CREDIT_CARD = 'credit_card',
  BANK_SLIP = 'bank_slip',
}

@Entity('charges')
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ManyToOne(() => Customer, (customer) => customer.charges, {
    onDelete: 'CASCADE',
  })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'varchar', length: 255 })
  payer_name: string;

  @Column({ type: 'varchar', length: 20 })
  payer_document: string;

  @Column({ type: 'real' })
  amount: number; // em centavos

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({
    type: 'enum',
    enum: PaymentMethod,
  })
  payment_method: PaymentMethod;

  @Column({ type: 'varchar', length: 255, nullable: true })
  pix_key: string;

  @Column({ type: 'timestamp', nullable: true })
  expiration_date: Date;

  // Campos específicos para Cartão de Crédito
  @Column({ type: 'varchar', length: 19, nullable: true })
  card_number: string;

  @Column({ type: 'varchar', length: 5, nullable: true })
  card_expiry: string;

  @Column({ type: 'varchar', length: 4, nullable: true })
  card_cvv: string;

  @Column({ type: 'varchar', length: 100, nullable: true })
  card_holder_name: string;

  @Column({ type: 'int', nullable: true })
  installments: number;

  // Campos específicos para Boleto
  @Column({ type: 'varchar', length: 47, nullable: true })
  bank_slip_code: string;

  @Column({ type: 'varchar', length: 255, nullable: true })
  bank_slip_url: string;

  @Column({ type: 'timestamp', nullable: true })
  due_date: Date;

  @Column({
    type: 'enum',
    enum: ChargeStatus,
    default: ChargeStatus.PENDING,
  })
  status: ChargeStatus;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;
}
