import { ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';
import { CreateBookingDto } from './create-booking.dto';
import { Transform } from 'class-transformer';

export class UpdateBookingDto extends PartialType(CreateBookingDto) {
  @ApiPropertyOptional({ example: '21:30' })
  @IsOptional()
  @IsString()
  expectedLeaveTime?: string;

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
}
