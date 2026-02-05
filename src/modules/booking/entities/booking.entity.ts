import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn, UpdateDateColumn, DeleteDateColumn, ManyToOne, ManyToMany, JoinTable, JoinColumn } from 'typeorm';
import { Customer } from '../../customer/entities/customer.entity';
import { Table } from '../../table-management/entities/table.entity';
import { Menu } from '../../menu-management/entities/menu.entity';

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

  @ManyToOne(() => Customer, { nullable: false })
  @JoinColumn({ name: 'customer_id' })
  customer: Customer;

  @Column({ type: 'date' })
  date: string;

  @Column({ type: 'time' })
  time: string;

  @Column({ name: 'total_pax' })
  totalPax: number;

  @Column({ type: 'text', nullable: true })
  note: string;

  @Column({ name: 'downpayment_proof', nullable: true })
  downpaymentProof: string;

  @ManyToOne(() => Table, { nullable: false })
  @JoinColumn({ name: 'table_id' })
  table: Table;

  @ManyToMany(() => Menu)
  @JoinTable({
    name: 'booking_menus',
    joinColumn: { name: 'booking_id', referencedColumnName: 'id' },
    inverseJoinColumn: { name: 'menu_id', referencedColumnName: 'id' },
  })
  menus: Menu[];

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
