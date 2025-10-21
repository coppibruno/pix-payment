import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
} from 'typeorm';

export enum ChargeStatus {
  PENDING = 'pending',
  PAID = 'paid',
  EXPIRED = 'expired',
  CANCELLED = 'cancelled',
}

@Entity('charges')
export class Charge {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ type: 'varchar', length: 255 })
  payer_name: string;

  @Column({ type: 'varchar', length: 20 })
  payer_document: string;

  @Column({ type: 'real' })
  amount: number; // em centavos

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column({ type: 'varchar', length: 255 })
  pix_key: string;

  @Column({ type: 'timestamp' })
  expiration_date: Date;

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
