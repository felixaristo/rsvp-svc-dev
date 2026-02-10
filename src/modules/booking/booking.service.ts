import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Customer } from '../customer/entities/customer.entity';
import { Table } from '../table-management/entities/table.entity';
import { Menu } from '../menu-management/entities/menu.entity';
import { BookingMenu } from './entities/booking-menu.entity';

@Injectable()
export class BookingService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Table)
    private readonly tableRepository: Repository<Table>,
    @InjectRepository(Menu)
    private readonly menuRepository: Repository<Menu>,
  ) {}

  private generateBookingCode(length = 6): string {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  }

  async create(createBookingDto: CreateBookingDto, photoPath?: string): Promise<Booking> {
    try {
      console.log('Creating booking with DTO:', JSON.stringify(createBookingDto));
      const { customerId, tableId, menus, ...bookingData } = createBookingDto;
      console.log('data menus', menus);
      

      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }

      const table = await this.tableRepository.findOne({ where: { id: tableId } });
      if (!table) {
        throw new NotFoundException(`Table with ID ${tableId} not found`);
      }

      const booking = this.bookingRepository.create({
        ...bookingData,
        customer,
        table,
        bookingCode: this.generateBookingCode(),
        downpaymentProof: photoPath,
      });
      console.log('Booking entity created (not saved):', booking);

      const savedBooking = await this.bookingRepository.save(booking);
      console.log('Booking saved successfully:', savedBooking);

      if (menus) {
        console.log(menus);
        let parsedMenus: any[] = [];
        if (typeof menus === 'string') {
          try {
            parsedMenus = JSON.parse(menus);
          } catch (e) {
            console.error('Error parsing menus:', e);
            parsedMenus = [];
          }
        } else {
          parsedMenus = menus;
        }
        
        const menuIds = parsedMenus.map((m) => m.menuId); 
        console.log(menuIds);
        
        const existingMenus = await this.menuRepository.findBy({ id: In(menuIds) });
        console.log('ini', existingMenus);
        
        if (existingMenus.length !== menuIds.length) {
          throw new NotFoundException('Some menus not found');
        }

        const bookingMenus = parsedMenus.map((m) => {
          const bm = new BookingMenu();
          bm.bookingId = savedBooking.id;
          bm.menuId = m.menuId;
          bm.qty = m.qty;
          bm.menu = existingMenus.find(em => em.id === m.menuId)!;
          return bm;
        });
        
        // Save booking menus explicitly
        await this.bookingRepository.manager.save(BookingMenu, bookingMenus);
        console.log('Booking menus saved:', bookingMenus);
        
        savedBooking.bookingMenus = bookingMenus;
      }
      return savedBooking;
    } catch (error) {
      console.error('Error creating booking:', error);
      throw error;
    }
  }

  async findAll(page: number, limit: number): Promise<{ items: Booking[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.bookingRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['customer', 'table', 'bookingMenus', 'bookingMenus.menu'],
      order: {
        id: 'DESC',
      },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['customer', 'table', 'bookingMenus', 'bookingMenus.menu'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, photoPath?: string): Promise<Booking> {
    const booking = await this.findOne(id);
    const { customerId, tableId, menus, ...bookingData } = updateBookingDto;

    if (customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
      booking.customer = customer;
    }

    if (tableId) {
      const table = await this.tableRepository.findOne({ where: { id: tableId } });
      if (!table) throw new NotFoundException(`Table with ID ${tableId} not found`);
      booking.table = table;
    }

    if (menus) {
      let parsedMenus: any[] = [];
      if (typeof menus === 'string') {
        try {
          parsedMenus = JSON.parse(menus);
        } catch (e) {
          console.error('Error parsing menus:', e);
          parsedMenus = [];
        }
      } else {
        parsedMenus = menus;
      }

      const menuIds = parsedMenus.map((m) => m.menuId);
      const existingMenus = await this.menuRepository.findBy({ id: In(menuIds) });
      if (existingMenus.length !== menuIds.length) {
        throw new NotFoundException('Some menus not found');
      }

      // Delete existing menus
      await this.bookingRepository.manager.delete(BookingMenu, { bookingId: id });

      // Create new menus
      const bookingMenus = parsedMenus.map((m) => {
        const bm = new BookingMenu();
        bm.bookingId = id;
        bm.menuId = m.menuId;
        bm.qty = m.qty;
        bm.menu = existingMenus.find(em => em.id === m.menuId)!;
        return bm;
      });

      await this.bookingRepository.manager.save(BookingMenu, bookingMenus);
      booking.bookingMenus = bookingMenus;
    }

    Object.assign(booking, bookingData);
    if (photoPath) {
      booking.downpaymentProof = photoPath;
    }

    return await this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.softRemove(booking);
  }
}
