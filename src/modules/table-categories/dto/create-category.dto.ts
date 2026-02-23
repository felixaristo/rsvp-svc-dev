import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsString, IsOptional, IsNumber } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateCategoryDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  name: string;

   @ApiProperty({ required: false })
   @IsOptional()
   @Type(() => Number)
   @IsNumber()
   branchId?: number;
}
