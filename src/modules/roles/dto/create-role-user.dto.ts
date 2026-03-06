import { ApiProperty } from '@nestjs/swagger';
import { Transform } from 'class-transformer';
import { IsString, IsNotEmpty, IsIn, IsNumber, IsOptional } from 'class-validator';

export class CreateRoleUserDto {
  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  username: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  fullname: string;

  @ApiProperty()
  @IsString()
  @IsNotEmpty()
  password: string;

  @ApiProperty()
  @IsNumber()
  role: number;

  @IsOptional()
  @Transform(({ value }) => (value ? parseInt(value) : undefined))
  @IsNumber()
  branchId?: number;
}
