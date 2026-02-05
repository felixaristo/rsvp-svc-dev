import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, IsDateString } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';
import { Transform } from 'class-transformer';

export class CreateBookingDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  customerId: number;

  @ApiProperty({ example: '2023-12-25' })
  @IsNotEmpty()
  @IsString()
  date: string;

  @ApiProperty({ example: '18:00' })
  @IsNotEmpty()
  @IsString()
  time: string;

  @ApiProperty({ example: 4 })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  totalPax: number;

  @ApiPropertyOptional({ example: 'Anniversary dinner' })
  @IsOptional()
  @IsString()
  note?: string;

  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  tableId: number;

  @ApiPropertyOptional({ example: [1, 2], type: [Number] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (typeof value === 'string') {
      return value.split(',').map((v: string) => parseInt(v.trim()));
    }
    return value;
  })
  menuIds?: number[];

  @ApiPropertyOptional({ enum: BookingStatus, default: BookingStatus.WAITING_LIST })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  downpaymentProof?: any;
}
