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
