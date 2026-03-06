import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  CreateDateColumn,
  UpdateDateColumn,
  DeleteDateColumn,
} from 'typeorm';
import { FileUrlTransformer } from '../../../common/transformers/file-url.transformer';

@Entity('tenant')
export class Tenant {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ nullable: true, transformer: new FileUrlTransformer() })
  logo: string;

  @Column()
  name: string;

  @Column({ type: 'text', nullable: true })
  description: string;

  @Column()
  address: string;

  @Column({ name: 'account_number' })
  accountNumber: string;

  @Column()
  city: string;

  @Column()
  state: string;

  @Column({ name: 'postal_code' })
  postalCode: string;

  @Column()
  country: string;

  @Column()
  phone: string;

  @Column()
  email: string;

  @Column({ nullable: true })
  website: string;

  @Column({ nullable: true })
  layout: string;

  @Column({ name: 'primary_color', nullable: true })
  primaryColor: string;

  @Column({ name: 'secondary_color', nullable: true })
  secondaryColor: string;

  @Column({ name: 'button_hover_color', nullable: true })
  buttonHoverColor: string;

  @Column({ name: 'open_hours', nullable: true })
  openHours: string;

  @Column({ name: 'closed_hours', nullable: true })
  closedHours: string;

  @Column({ default: 'OPEN' })
  status: string;

  @Column({ name: 'stay_duration', nullable: true })
  stayDuration: number;

  @Column({ name: 'terms_n_conditions', type: 'text', nullable: true })
  termsNConditions: string;

  @Column({ name: 'bank_type', nullable: true })
  bankType: string;

  @Column({ name: 'bank_name', nullable: true })
  bankName: string;

  @Column({ name: 'minimum_pax', type: 'int', nullable: true })
  minimumPax: number;

  @Column({ name: 'minimum_dp', type: 'int', nullable: true })
  minimumDP: number;

  @Column({ name: 'minimum_payment', type: 'int', nullable: true })
  minimumPayment: number;

  @Column({ name: 'minimum_percentage', type: 'int', nullable: true })
  minimumPercentage: number;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
