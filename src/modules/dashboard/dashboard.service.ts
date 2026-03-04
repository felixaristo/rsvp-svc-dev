import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Booking, BookingStatus } from '../booking/entities/booking.entity';
import { Customer } from '../customer/entities/customer.entity';
import { GetDashboardSummaryDto } from './dto/get-dashboard-summary.dto';

@Injectable()
export class DashboardService {
  constructor(
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  private timeToMinutes(time?: string | null): number | null {
    if (!time) return null;
    const t = String(time).trim();
    if (!t) return null;

    const ampmMatch = t.match(/^(\d{1,2}):(\d{2})\s*(am|pm)$/i);
    if (ampmMatch) {
      const hourRaw = parseInt(ampmMatch[1], 10);
      const minute = parseInt(ampmMatch[2], 10);
      const modifier = ampmMatch[3].toLowerCase();
      if (isNaN(hourRaw) || isNaN(minute) || minute < 0 || minute > 59) return null;
      if (hourRaw < 1 || hourRaw > 12) return null;

      let hour = hourRaw;
      if (modifier === 'pm' && hour < 12) hour += 12;
      if (modifier === 'am' && hour === 12) hour = 0;
      return hour * 60 + minute;
    }

    const match24 = t.match(/^(\d{1,2}):(\d{2})$/);
    if (!match24) return null;
    const hour = parseInt(match24[1], 10);
    const minute = parseInt(match24[2], 10);
    if (isNaN(hour) || isNaN(minute)) return null;
    if (hour < 0 || hour > 23) return null;
    if (minute < 0 || minute > 59) return null;
    return hour * 60 + minute;
  }

  async getBookingsByTime(fromDate: string, toDate: string) {
    const bookings = await this.bookingRepository.find({
      where: { date: Between(fromDate, toDate) },
      select: ['id', 'time'],
    });

    const totals = {
      morning: 0,
      afternoon: 0,
      evening: 0,
      night: 0,
    };

    for (const b of bookings) {
      const minutes = this.timeToMinutes(b.time);
      if (minutes === null) continue;

      if (minutes >= 6 * 60 && minutes <= 10 * 60 + 59) totals.morning += 1;
      else if (minutes >= 11 * 60 && minutes <= 14 * 60 + 59)
        totals.afternoon += 1;
      else if (minutes >= 15 * 60 && minutes <= 17 * 60 + 59)
        totals.evening += 1;
      else if (minutes >= 18 * 60 && minutes <= 23 * 60) totals.night += 1;
    }

    return { fromDate, toDate, ...totals };
  }

  async getSummary(filterDto: GetDashboardSummaryDto) {
    const { fromDate, toDate } = filterDto;
    const where: any = {};

    // Apply date filter to bookings
    if (fromDate && toDate) {
      where.date = Between(fromDate, toDate);
    } else if (fromDate) {
      where.date = MoreThanOrEqual(fromDate);
    } else if (toDate) {
      where.date = LessThanOrEqual(toDate);
    }

    const bookings = await this.bookingRepository.find({
      where,
      relations: ['customer'],
    });

    const totalBookings = bookings.length;

    // Total Guests (from customers) - Logic:
    // If we want unique customers who booked in this period:
    const uniqueCustomerIds = new Set();
    bookings.forEach(b => {
      if (b.customer && b.customer.id) {
        uniqueCustomerIds.add(b.customer.id);
      }
    });
    const totalUniqueCustomers = uniqueCustomerIds.size;

    // Avg Party Size
    const totalPax = bookings.reduce((sum, booking) => sum + (Number(booking.totalPax) || 0), 0);
    const avgPartySize = totalBookings > 0 ? totalPax / totalBookings : 0;

    // Cancellation Rate
    const cancelledBookings = bookings.filter(b => b.status === BookingStatus.CANCELLED).length;
    const cancellationRate = totalBookings > 0 ? (cancelledBookings / totalBookings) * 100 : 0;

    // Breakdown by status
    const breakdown: Record<string, number> = {};
    Object.values(BookingStatus).forEach(status => {
      breakdown[status] = 0;
    });
    
    bookings.forEach(booking => {
      if (breakdown[booking.status] !== undefined) {
        breakdown[booking.status]++;
      }
    });

    return {
      totalBookings,
      totalGuests: totalUniqueCustomers, 
      totalPax, 
      avgPartySize: Number(avgPartySize.toFixed(2)),
      cancellationRate: Number(cancellationRate.toFixed(2)),
      breakdown,
    };
  }
}
