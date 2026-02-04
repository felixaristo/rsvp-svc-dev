import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateMenuCategoryDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsString()
  name: string;
}
