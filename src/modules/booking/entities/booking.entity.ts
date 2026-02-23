import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, OneToMany, JoinColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Table } from '../../table-management/entities/table.entity';
import { BookingMenu } from './booking-menu.entity';
import { FileUrlTransformer } from '../../../common/transformers/file-url.transformer';
import { Branch } from '../../branch/entities/branch.entity';

export enum BookingStatus {
  WAITING_LIST = 'waiting_list',
  CONFIRM = 'confirm',
  SEATED = 'seated',
  COMPLETED = 'completed',
  CANCELLED = 'cancelled',
}

@Entity('booking')
export class Booking {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_code', unique: true, length: 6, nullable: true })
  bookingCode: string;

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'varchar', length: 20, nullable: true })
  time: string;

  @Column({ name: 'total_pax' })
  totalPax: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'downpayment_proof', nullable: true, transformer: new FileUrlTransformer() })
  downpaymentProof: string;

  @Column({ name: 'spend_money', type: 'decimal', nullable: true })
  spendMoney: number;

  @Column({ name: 'expected_leave_time', type: 'varchar', nullable: true })
  expectedLeaveTime: string;

   @Column({ type: 'varchar', length: 50, nullable: true })
   channel: string;

  @Column({ name: 'leave_time', type: 'varchar', nullable: true })
  leaveTime: string;

  @ManyToOne(() => Table, { nullable: true })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToOne(() => Branch, { nullable: false })
  @JoinColumn({ name: 'branch_id' })
  branch: Branch;

  @OneToMany(() => BookingMenu, (bookingMenu) => bookingMenu.booking, { cascade: true })
  bookingMenus: BookingMenu[];

  @Column({
    type: 'enum',
    enum: BookingStatus,
    default: BookingStatus.WAITING_LIST,
  })
  status: BookingStatus;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;

  @DeleteDateColumn({ name: 'deleted_at' })
  deletedAt: Date;
}
