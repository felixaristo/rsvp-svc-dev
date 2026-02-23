import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsDateString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreatePromotionDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  title: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  description: string;

  @ApiProperty()
  @IsDateString()
  from_date: string;

  @ApiProperty()
  @IsDateString()
  to_date: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @Type(() => Number)
  @IsNumber()
  branchId?: number;
}
