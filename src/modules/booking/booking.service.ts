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
import { Branch } from '../branch/entities/branch.entity';
import { CloseOut } from '../close-out/entities/close-out.entity';

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
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(CloseOut)
    private readonly closeOutRepository: Repository<CloseOut>,
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

  private parseDateTime(dateStr: string, timeStr: string): Date {
    let hours: number;
    let minutes: number;
    const cleanTimeStr = timeStr ? timeStr.trim() : '00:00';

    if (cleanTimeStr.toLowerCase().includes('m')) {
      const [timePart, modifier] = cleanTimeStr.split(' ');
      const [hStr, mStr] = timePart.split(':');
      hours = parseInt(hStr, 10);
      minutes = parseInt(mStr, 10);

      if (modifier && modifier.toLowerCase() === 'pm' && hours < 12) {
        hours += 12;
      }
      if (modifier && modifier.toLowerCase() === 'am' && hours === 12) {
        hours = 0;
      }
    } else {
      const [hStr, mStr] = cleanTimeStr.split(':');
      hours = parseInt(hStr, 10);
      minutes = parseInt(mStr, 10);
    }

    const [yearStr, monthStr, dayStr] = dateStr.split('-') || [];
    return new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dayStr, 10),
      hours,
      minutes,
      0,
    );
  }

  private calculateExpectedLeaveTime(date: string, time: string, durationMinutes: number): string {
    const timeStr = time.trim();
    let hours: number;
    let minutes: number;

    if (timeStr.toLowerCase().includes('m')) {
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
    } else {
      const [hStr, mStr] = timeStr.split(':');
      hours = parseInt(hStr, 10);
      minutes = parseInt(mStr, 10);
    }

    const [yearStr, monthStr, dayStr] = date.split('-') || [];
    const bookingDateTime = new Date(
      parseInt(yearStr, 10),
      parseInt(monthStr, 10) - 1,
      parseInt(dayStr, 10),
      hours,
      minutes,
      0,
    );

    if (!isNaN(bookingDateTime.getTime())) {
      const expectedLeaveDate = new Date(bookingDateTime.getTime() + durationMinutes * 60000);
      const leaveHours = expectedLeaveDate.getHours();
      const leaveMinutes = expectedLeaveDate.getMinutes();
      const hoursStr = String(leaveHours).padStart(2, '0');
      const minutesStr = String(leaveMinutes).padStart(2, '0');
      return `${hoursStr}:${minutesStr}`;
    }
    return '';
  }

  async create(createBookingDto: CreateBookingDto, photoPath?: string): Promise<Booking> {
    try {
      console.log('Creating booking with DTO:', JSON.stringify(createBookingDto));
      const { customerId, tableIds, menus, branchId, totalPax, ...bookingData } = createBookingDto;
      
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) {
        throw new NotFoundException(`Customer with ID ${customerId} not found`);
      }

      const effectiveBranchId = branchId ?? 1;
      const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
      }

      // Handle expected leave time and auto table assignment
      let expectedLeaveTime = bookingData.expectedLeaveTime;
      let tables: Table[] = [];

      const tenant = await this.tenantService.forMicrosite(1);
      
      // Auto-set expected leave time if not provided
      if (!expectedLeaveTime && tenant.stayDuration) {
        expectedLeaveTime = this.calculateExpectedLeaveTime(bookingData.date, bookingData.time, tenant.stayDuration);
      }

      if (tableIds && tableIds.length > 0) {
        const uniqueTableIds = Array.from(new Set(tableIds));
        tables = await this.tableRepository.findBy({ id: In(uniqueTableIds) });
        if (tables.length !== uniqueTableIds.length) {
          throw new NotFoundException('Some tables not found');
        }
      } else {
        // Auto assign tables based on pax
        // Find available tables
        const allTables = await this.tableRepository.find({
          where: { branch: { id: effectiveBranchId } },
          order: { covers: 'ASC' }
        });

        // Simple check for availability: check if any booking overlaps
        // Note: This is a simplified availability check. 
        // Real-world scenarios need more complex time slot management.
        // We assume 'date' and 'time' + 'stayDuration' defines the slot.
        
        // Find existing bookings for the date to filter out occupied tables
        const existingBookings = await this.bookingRepository.find({
          where: {
            date: bookingData.date,
            status: In([BookingStatus.CONFIRM, BookingStatus.SEATED, BookingStatus.WAITING_LIST]),
            branch: { id: effectiveBranchId }
          },
          relations: ['tables']
        });

        const requestedStart = this.parseDateTime(bookingData.date, bookingData.time);
        const requestedEnd = this.parseDateTime(bookingData.date, expectedLeaveTime || bookingData.time); // Fallback if no expectedLeaveTime, effectively 0 duration check? No, let's use tenant duration if calculated.
        
        // Re-calculate requested end if we have duration
        let effectiveRequestedEnd = requestedEnd;
        if (tenant.stayDuration) {
           const endWithDuration = new Date(requestedStart.getTime() + tenant.stayDuration * 60000);
           effectiveRequestedEnd = endWithDuration;
        }

        const occupiedTableIds = new Set<number>();
        
        for (const b of existingBookings) {
          const bStart = this.parseDateTime(b.date, b.time);
          const bEnd = b.expectedLeaveTime 
            ? this.parseDateTime(b.date, b.expectedLeaveTime)
            : new Date(bStart.getTime() + (tenant.stayDuration || 60) * 60000); // Default 60 mins if unknown

          // Check overlap
          if (requestedStart < bEnd && effectiveRequestedEnd > bStart) {
             b.tables.forEach(t => occupiedTableIds.add(t.id));
          }
        }

        const availableTables = allTables.filter(t => !occupiedTableIds.has(t.id));

        if (availableTables.length === 0) {
          console.log('No tables available for this time slot. Proceeding with empty tables.');
        } else {
          // Strategy:
          // 1. Try to find a single table with covers >= totalPax (Best Fit)
          const bestSingleTable = availableTables.find(t => t.covers >= totalPax);
          
          if (bestSingleTable) {
            tables = [bestSingleTable];
          } else {
            // 2. Join tables
            // User requested "join table ke terdekatnya" (closest).
            // Since we don't have physical coordinates, we assume sequential table numbers imply proximity.
            // We sort by table number to try to pick adjacent tables.
            const sortedAvailable = [...availableTables].sort((a, b) => 
              a.number.localeCompare(b.number, undefined, { numeric: true })
            );

            let currentPax = 0;
            const selectedTables: Table[] = [];

            for (const t of sortedAvailable) {
              selectedTables.push(t);
              currentPax += t.covers;
              if (currentPax >= totalPax) {
                break;
              }
            }

            if (currentPax < totalPax) {
               console.log(`Not enough tables available for ${totalPax} pax (Available capacity: ${currentPax}). Proceeding with empty tables.`);
               tables = [];
            } else {
               tables = selectedTables;
            }
          }
        }
      }

      const booking = this.bookingRepository.create({
        ...bookingData,
        totalPax,
        channel: bookingData.channel ?? '',
        expectedLeaveTime,
        customer,
        tables,
        branch,
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

  async findAll(page: number, limit: number, filterDto?: GetBookingsFilterDto): Promise<{ items: Booking[]; total: number; page: number; limit: number; closeOuts?: CloseOut[] }> {
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
      relations: ['customer', 'tables', 'branch', 'bookingMenus', 'bookingMenus.menu'],
      order: {
        id: 'DESC',
      },
    });

    let closeOuts: any[] = [];
    const closeOutWhere: any = {};

    if (fromDate && toDate) {
      closeOutWhere.fromDate = LessThanOrEqual(toDate);
      closeOutWhere.toDate = MoreThanOrEqual(fromDate);
    } else if (fromDate) {
      closeOutWhere.toDate = MoreThanOrEqual(fromDate);
    } else if (toDate) {
      closeOutWhere.fromDate = LessThanOrEqual(toDate);
    }

    if (Object.keys(closeOutWhere).length > 0) {
      const rawCloseOuts = await this.closeOutRepository.find({
        where: closeOutWhere,
        relations: ['category'],
      });

      const categoryIds = [...new Set(rawCloseOuts.map(c => c.category.id))];
      
      let tables: Table[] = [];
      if (categoryIds.length > 0) {
        tables = await this.tableRepository.find({
          where: {
            category: { id: In(categoryIds) },
          },
          relations: ['category'],
        });
      }

      closeOuts = rawCloseOuts.map(c => {
        const categoryTables = tables
          .filter(t => t.category.id === c.category.id)
          .map(t => t.id);

        return {
          fromDate: c.fromDate,
          toDate: c.toDate,
          fromTime: c.fromTime,
          untilTime: c.untilTime,
          tableIds: categoryTables,
        };
      });
    }

    return {
      items,
      total,
      page,
      limit,
      closeOuts,
    };
  }

  async findOne(id: number): Promise<Booking> {
    const booking = await this.bookingRepository.findOne({
      where: { id },
      relations: ['customer', 'tables', 'branch', 'bookingMenus', 'bookingMenus.menu'],
    });
    if (!booking) {
      throw new NotFoundException(`Booking with ID ${id} not found`);
    }
    return booking;
  }

  async update(id: number, updateBookingDto: UpdateBookingDto, photoPath?: string): Promise<Booking> {
    const { customerId, tableIds, menus, branchId, ...bookingData } = updateBookingDto;

    const updatePayload: Partial<Booking> & { id: number } = {
      id,
      ...bookingData,
    };

    if (bookingData.status === BookingStatus.CONFIRM || bookingData.status === BookingStatus.SEATED) {
      try {
        const tenant = await this.tenantService.forMicrosite(1);
        if (tenant.stayDuration) {
          const bookingDateStr = bookingData.date;

          const timeStr = bookingData.time?.trim() ?? '';
          let hours: number;
          let minutes: number;

          if (timeStr.toLowerCase().includes('m')) {
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
          } else {
            const [hStr, mStr] = timeStr.split(':');
            hours = parseInt(hStr, 10);
            minutes = parseInt(mStr, 10);
          }

          const [yearStr, monthStr, dayStr] = bookingDateStr?.split('-') || [];
          const bookingDateTime = new Date(
            parseInt(yearStr, 10),
            parseInt(monthStr, 10) - 1,
            parseInt(dayStr, 10),
            hours,
            minutes,
            0,
          );

          if (!isNaN(bookingDateTime.getTime())) {
            const expectedLeaveDate = new Date(bookingDateTime.getTime() + tenant.stayDuration * 60000);
            const leaveHours = expectedLeaveDate.getHours();
            const leaveMinutes = expectedLeaveDate.getMinutes();
            const hoursStr = String(leaveHours).padStart(2, '0');
            const minutesStr = String(leaveMinutes).padStart(2, '0');
            updatePayload.expectedLeaveTime = `${hoursStr}:${minutesStr}`;
          }
        }
      } catch (error) {
        console.error('Error calculating expected leave time:', error);
      }
    } else if (bookingData.status === BookingStatus.COMPLETED) {
      const now = new Date();
      const hours = now.getHours();
      const minutes = now.getMinutes();
      const hoursStr = String(hours).padStart(2, '0');
      const minutesStr = String(minutes).padStart(2, '0');
      updatePayload.leaveTime = `${hoursStr}:${minutesStr}`;
    }

    if (bookingData.expectedLeaveTime !== undefined) {
      updatePayload.expectedLeaveTime = bookingData.expectedLeaveTime;
    }

    if (customerId) {
      const customer = await this.customerRepository.findOne({ where: { id: customerId } });
      if (!customer) throw new NotFoundException(`Customer with ID ${customerId} not found`);
      updatePayload.customer = customer;
    }

    if (tableIds && tableIds.length > 0) {
      const uniqueTableIds = Array.from(new Set(tableIds));
      const tables = await this.tableRepository.findBy({ id: In(uniqueTableIds) });
      if (tables.length !== uniqueTableIds.length) {
        throw new NotFoundException('Some tables not found');
      }
      (updatePayload as any).tables = tables;
    }

    if (branchId !== undefined) {
      const effectiveBranchId = branchId ?? 1;
      const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
      }
      (updatePayload as any).branch = branch;
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
    }

    if (photoPath) {
      updatePayload.downpaymentProof = photoPath;
    }

    await this.bookingRepository.save(updatePayload);
    return this.findOne(id);
  }

  async remove(id: number): Promise<void> {
    const booking = await this.findOne(id);
    await this.bookingRepository.softRemove(booking);
  }
}
