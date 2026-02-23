import { Entity, Column, PrimaryGeneratedColumn, ManyToOne, JoinColumn, CreateDateColumn, UpdateDateColumn } from 'typeorm';
import { Booking } from './booking.entity';
import { Menu } from '../../menu-management/entities/menu.entity';

@Entity('booking_menu')
export class BookingMenu {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ name: 'booking_id' })
  bookingId: number;

  @Column({ name: 'menu_id' })
  menuId: number;
  
  @Column({ default: 1 })
  qty: number;

  @ManyToOne(() => Booking, (booking) => booking.bookingMenus, { onDelete: 'CASCADE' })
  @JoinColumn({ name: 'booking_id' })
  booking: Booking;

  @ManyToOne(() => Menu, { nullable: false })
  @JoinColumn({ name: 'menu_id' })
  menu: Menu;

  @CreateDateColumn({ name: 'created_at', default: () => 'CURRENT_TIMESTAMP' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at', default: () => 'CURRENT_TIMESTAMP' })
  updatedAt: Date;
}
