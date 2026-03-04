import { ApiProperty } from '@nestjs/swagger';
import { IsDateString, IsNotEmpty } from 'class-validator';

export class GetDashboardBookingsByTimeDto {
  @ApiProperty({ description: 'Filter by start date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ description: 'Filter by end date (YYYY-MM-DD)' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;
}
