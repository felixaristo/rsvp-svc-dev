import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsNumber,
  IsEnum,
  IsArray,
  ValidateNested,
} from 'class-validator';
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

  @ApiProperty({ example: '19:00' })
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

  @ApiPropertyOptional({ example: 'walk-in' })
  @IsOptional()
  @IsString()
  channel?: string;

  @ApiPropertyOptional({ example: '21:30' })
  @IsOptional()
  @IsString()
  expectedLeaveTime?: string;

  @ApiPropertyOptional({ type: [Number], example: [1, 2] })
  @IsOptional()
  @IsArray()
  @Transform(({ value }) => {
    if (Array.isArray(value)) {
      return value.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed.map((v) => parseInt(v, 10)).filter((v) => !isNaN(v));
        }
        if (typeof parsed === 'number' && !isNaN(parsed)) {
          return [parsed];
        }
      } catch (e) {
        if (value.includes(',')) {
          return value
            .split(',')
            .map((part) => parseInt(part.trim(), 10))
            .filter((v) => !isNaN(v));
        }
        const single = parseInt(value, 10);
        if (!isNaN(single)) {
          return [single];
        }
      }
    }
    return undefined;
  })
  @IsNumber({}, { each: true })
  tableIds?: number[];

  @ApiPropertyOptional({ example: 1 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Table Category ID' })
  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  categoryId?: number;

  @ApiPropertyOptional({ example: '[{"menuId":1,"qty":2}]' })
  @IsOptional()
  menus?: any;

  @ApiPropertyOptional({
    enum: BookingStatus,
    default: BookingStatus.WAITING_LIST,
  })
  @IsOptional()
  @IsEnum(BookingStatus)
  status?: BookingStatus;

  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  downpaymentProof?: any;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @Transform(({ value }) => (value ? parseFloat(value) : undefined))
  @IsNumber()
  spendMoney?: number;

  @ApiPropertyOptional({ example: true, description: 'Apakah membutuhkan DP' })
  @IsOptional()
  @Transform(({ value, obj }) => {
    if (typeof value === 'boolean') return value;
    if (
      value === undefined &&
      obj &&
      Object.prototype.hasOwnProperty.call(obj, 'need_dp')
    ) {
      const v = obj['need_dp'];
      if (typeof v === 'boolean') return v;
      if (typeof v === 'string')
        return ['true', '1', 'yes', 'on'].includes(v.toLowerCase());
      if (typeof v === 'number') return v === 1;
    }
    if (typeof value === 'string') {
      return ['true', '1', 'yes', 'on'].includes(value.toLowerCase());
    }
    if (typeof value === 'number') return value === 1;
    return undefined;
  })
  needDp?: boolean;

  @ApiPropertyOptional({ example: 'REF-123456' })
  @IsOptional()
  @Transform(({ value, obj }) => {
    if (typeof value === 'string') return value;
    if (
      value === undefined &&
      obj &&
      Object.prototype.hasOwnProperty.call(obj, 'reference_number')
    ) {
      const v = obj['reference_number'];
      if (typeof v === 'string') return v;
    }
    return undefined;
  })
  @IsString()
  referenceNumber?: string;
}
