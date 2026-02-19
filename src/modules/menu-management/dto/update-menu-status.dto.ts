import { ApiProperty } from '@nestjs/swagger';
import { IsBoolean } from 'class-validator';

export class UpdateMenuStatusDto {
  @ApiProperty({ example: true })
  @IsBoolean()
  status: boolean;
}

