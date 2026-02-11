import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEnum, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { BookingStatus } from '../entities/booking.entity';
import { Transform, Type } from 'class-transformer';

export class CreateBookingMenuItemDto {
  @ApiProperty({ example: 1 })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  menuId: number;

  @ApiProperty({ example: 2 })
  @IsNotEmpty()
  @Transform(({ value }) => parseInt(value))
  @IsNumber()
  qty: number;
}

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

  @ApiProperty({ example: '07:00 PM' })
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

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsNumber()
  tableId?: number;

  @ApiPropertyOptional({ example: '[{"menuId":1,"qty":2}]' })
  @IsOptional()
  menus?: any;

  @ApiPropertyOptional({ enum: BookingStatus, default: BookingStatus.WAITING_LIST })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  downpaymentProof?: any;
}
