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
      return value
        .map((v) => parseInt(v, 10))
        .filter((v) => !isNaN(v));
    }
    if (typeof value === 'string') {
      try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
          return parsed
            .map((v) => parseInt(v, 10))
            .filter((v) => !isNaN(v));
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
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsNumber()
  branchId?: number;

  @ApiPropertyOptional({ example: 1, description: 'Table Category ID' })
  @IsOptional()
  @Transform(({ value }) => value ? parseInt(value) : undefined)
  @IsNumber()
  categoryId?: number;

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

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  @Transform(({ value }) => value ? parseFloat(value) : undefined)
  @IsNumber()
  spendMoney?: number;
}
