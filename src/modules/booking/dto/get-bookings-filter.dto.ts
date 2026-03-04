import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsDateString } from 'class-validator';
import { BookingStatus, BookingStatusDp } from '../entities/booking.entity';

export class GetBookingsFilterDto {
  @ApiPropertyOptional({ description: 'Filter by start date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter by end date (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;

  @ApiPropertyOptional({
    enum: BookingStatus,
    description: 'Filter by booking status',
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({
    enum: BookingStatusDp,
    description: 'Filter by DP status',
  })
  @IsOptional()
  @IsEnum(BookingStatusDp)
  statusDp?: BookingStatusDp;
}
