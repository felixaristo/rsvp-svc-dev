import { IsNotEmpty, IsString, IsDateString, IsNumber, Matches, IsOptional } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateCloseOutDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  title: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsNumber()
  categoryId: number;

  @ApiProperty({ example: '2023-12-25' })
  @IsNotEmpty()
  @IsDateString()
  fromDate: string;

  @ApiProperty({ example: '2023-12-26' })
  @IsNotEmpty()
  @IsDateString()
  toDate: string;

  @ApiProperty({ example: '08:00', description: '24-hour format HH:mm' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'fromTime must be in HH:mm format' })
  fromTime: string;

  @ApiProperty({ example: '22:00', description: '24-hour format HH:mm' })
  @IsNotEmpty()
  @IsString()
  @Matches(/^([01]\d|2[0-3]):([0-5]\d)$/, { message: 'untilTime must be in HH:mm format' })
  untilTime: string;

  @ApiProperty({ example: 1, required: false })
  @IsOptional()
  @IsNumber()
  branchId?: number = 1;
}
