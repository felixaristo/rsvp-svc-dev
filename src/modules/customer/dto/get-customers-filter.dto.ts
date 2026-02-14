import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsDateString } from 'class-validator';

export class GetCustomersFilterDto {
  @ApiPropertyOptional({ description: 'Search by full name' })
  @IsOptional()
  search?: string;

  @ApiPropertyOptional({ description: 'Filter by created date start (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  fromDate?: string;

  @ApiPropertyOptional({ description: 'Filter by created date end (YYYY-MM-DD)' })
  @IsOptional()
  @IsDateString()
  toDate?: string;
}
