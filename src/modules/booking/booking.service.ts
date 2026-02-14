import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In, Between, MoreThanOrEqual, LessThanOrEqual, FindOptionsWhere } from 'typeorm';
import { Booking, BookingStatus } from './entities/booking.entity';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';
import { Customer } from '../customer/entities/customer.entity';
import { Table } from '../table-management/entities/table.entity';
import { Menu } from '../menu-management/entities/menu.entity';
import { BookingMenu } from './entities/booking-menu.entity';
import { TenantService } from '../tenant/tenant.service';

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
    private readonly tenantService: TenantService,
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

      let table: Table | undefined;
      if (tableId) {
        const foundTable = await this.tableRepository.findOne({ where: { id: tableId } });
        if (!foundTable) {
          throw new NotFoundException(`Table with ID ${tableId} not found`);
        }
        table = foundTable;
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

  async findAll(page: number, limit: number, filterDto?: GetBookingsFilterDto): Promise<{ items: Booking[]; total: number; page: number; limit: number }> {
    const { fromDate, toDate, status } = filterDto || {};
    const where: any = {};

    if (fromDate && toDate) {
      where.date = Between(fromDate, toDate);
    } else if (fromDate) {
      where.date = MoreThanOrEqual(fromDate);
    } else if (toDate) {
      where.date = LessThanOrEqual(toDate);
    }

    if (status) {
      where.status = status;
    }

    const [items, total] = await this.bookingRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      where,
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

    // Handle status changes for leave times
    if (bookingData.status && bookingData.status !== booking.status) {
      if (bookingData.status === BookingStatus.CONFIRM) {
        try {
          const tenant = await this.tenantService.forMicrosite(1);
          if (tenant.stayDuration) {
            let bookingDateStr: string;
            
            // Handle booking.date being Date object or string
            if ((booking.date as any) instanceof Date) {
              const d = booking.date as any as Date;
              const year = d.getFullYear();
              const month = String(d.getMonth() + 1).padStart(2, '0');
              const day = String(d.getDate()).padStart(2, '0');
              bookingDateStr = `${year}-${month}-${day}`;
            } else {
              bookingDateStr = String(booking.date);
            }

            // Normalize time string
            const timeStr = booking.time.trim();
            let hours: number;
            let minutes: number;

            if (timeStr.toLowerCase().includes('m')) { // AM/PM format
               const [timePart, modifier] = timeStr.split(' ');
               const [hStr, mStr] = timePart.split(':');
               hours = parseInt(hStr, 10);
               minutes = parseInt(mStr, 10);
               
               if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) {
                 hours += 12;
               }
               if (modifier && modifier.toLowerCase() === 'am' && hours === 12) {
                 hours = 0;
               }
            } else { // 24h format
               const [hStr, mStr] = timeStr.split(':');
               hours = parseInt(hStr, 10);
               minutes = parseInt(mStr, 10);
            }

            const [yearStr, monthStr, dayStr] = bookingDateStr.split('-');
             const bookingDateTime = new Date(
               parseInt(yearStr, 10),
               parseInt(monthStr, 10) - 1,
               parseInt(dayStr, 10),
               hours,
               minutes,
               0
             );

             if (!isNaN(bookingDateTime.getTime())) {
               const expectedLeaveDate = new Date(bookingDateTime.getTime() + tenant.stayDuration * 60000);
               let hours = expectedLeaveDate.getHours();
               const minutes = expectedLeaveDate.getMinutes();
               const ampm = hours >= 12 ? 'PM' : 'AM';
               hours = hours % 12;
               hours = hours ? hours : 12; // the hour '0' should be '12'
               const hoursStr = String(hours).padStart(2, '0');
               const minutesStr = String(minutes).padStart(2, '0');
               booking.expectedLeaveTime = `${hoursStr}:${minutesStr} ${ampm}`;
               console.log(`Calculated expectedLeaveTime: ${booking.expectedLeaveTime} for booking ${booking.id} with stayDuration ${tenant.stayDuration} mins`);
             } else {
                console.error('Invalid booking date/time for calculation', { date: booking.date, time: booking.time });
             }
          }
        } catch (error) {
          console.error('Error calculating expected leave time:', error);
        }
      } else if (bookingData.status === BookingStatus.COMPLETED) {
        const now = new Date();
        let hours = now.getHours();
        const minutes = now.getMinutes();
        const ampm = hours >= 12 ? 'PM' : 'AM';
        hours = hours % 12;
        hours = hours ? hours : 12; // the hour '0' should be '12'
        const hoursStr = String(hours).padStart(2, '0');
        const minutesStr = String(minutes).padStart(2, '0');
        booking.leaveTime = `${hoursStr}:${minutesStr} ${ampm}`;
      }
    }

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
