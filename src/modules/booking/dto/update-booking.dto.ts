import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({ example: '08:30 PM' })
  @IsOptional()
  @IsString()
  expectedLeaveTime?: string;
}
