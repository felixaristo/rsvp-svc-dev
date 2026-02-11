import { IsNotEmpty, IsOptional, IsString, IsNumber, IsEmail, IsArray, ValidateNested } from 'class-validator';
import { ApiProperty, ApiPropertyOptional, OmitType } from '@nestjs/swagger';
import { CreateBookingDto, CreateBookingMenuItemDto } from '../../booking/dto/create-booking.dto';
import { Transform, Type } from 'class-transformer';

export class CreateMicrositeBookingDto extends OmitType(CreateBookingDto, ['customerId', 'tableId', 'downpaymentProof', 'menus'] as const) {
  @ApiPropertyOptional({ type: [CreateBookingMenuItemDto] })
  @IsOptional()
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => CreateBookingMenuItemDto)
  menus?: CreateBookingMenuItemDto[];

  @ApiProperty({ example: 'John Doe', description: 'Customer Name' })
  @IsNotEmpty()
  @IsString()
  customerName: string;

  @ApiProperty({ example: '08123456789', description: 'Customer Phone' })
  @IsNotEmpty()
  @IsString()
  customerPhone: string;

  @ApiPropertyOptional({ example: 'john@example.com' })
  @IsOptional()
  @IsEmail()
  customerEmail?: string;

  @ApiPropertyOptional({ example: '@johndoe' })
  @IsOptional()
  @IsString()
  customerInstagram?: string;
}
