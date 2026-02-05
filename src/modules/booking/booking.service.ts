import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { Customer } from '../customer/entities/customer.entity';
import { Table } from '../table-management/entities/table.entity';
import { Menu } from '../menu-management/entities/menu.entity';

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

  async create(createBookingDto: CreateBookingDto, photoPath?: string): Promise<Booking> {
    const { customerId, tableId, menuIds, ...bookingData } = createBookingDto;

    const customer = await this.customerRepository.findOne({ where: { id: customerId } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${customerId} not found`);
    }

    const table = await this.tableRepository.findOne({ where: { id: tableId } });
    if (!table) {
      throw new NotFoundException(`Table with ID ${tableId} not found`);
    }

    let menus: Menu[] = [];
    if (menuIds && menuIds.length > 0) {
      menus = await this.menuRepository.findBy({ id: In(menuIds) });
    }

    const booking = this.bookingRepository.create({
      ...bookingData,
      customer,
      table,
      menus,
      downpaymentProof: photoPath,
    });

    return await this.bookingRepository.save(booking);
  }

  async findAll(page: number, limit: number): Promise<{ items: Booking[]; total: number; page: number; limit: number }> {
    const [items, total] = await this.bookingRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      relations: ['customer', 'table', 'menus'],
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
      relations: ['customer', 'table', 'menus'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, photoPath?: string): Promise<Booking> {
    const booking = await this.findOne(id);
    const { customerId, tableId, menuIds, ...bookingData } = updateBookingDto;

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

    if (menuIds) {
      const menus = await this.menuRepository.findBy({ id: In(menuIds) });
      booking.menus = menus;
    }

    if (photoPath) {
      booking.downpaymentProof = photoPath;
    }

    Object.assign(booking, bookingData);
    return await this.bookingRepository.save(booking);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.softRemove(booking);
  }
}
