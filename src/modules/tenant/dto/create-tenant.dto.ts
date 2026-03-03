import {
  IsNotEmpty,
  IsOptional,
  IsString,
  IsEmail,
  IsUrl,
} from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CreateTenantDto {
  @ApiPropertyOptional({ type: 'string', format: 'binary' })
  @IsOptional()
  logo?: any;

  @ApiProperty({ example: 'My Tenant' })
  @IsNotEmpty()
  @IsString()
  name: string;

  @ApiPropertyOptional({ example: 'A great place' })
  @IsOptional()
  @IsString()
  description?: string;

  @ApiProperty({ example: '123 Main St' })
  @IsNotEmpty()
  @IsString()
  address: string;

  @ApiProperty({ example: '1234567890' })
  @IsNotEmpty()
  @IsString()
  accountNumber: string;

  @ApiProperty({ example: 'New York' })
  @IsNotEmpty()
  @IsString()
  city: string;

  @ApiProperty({ example: 'NY' })
  @IsNotEmpty()
  @IsString()
  state: string;

  @ApiProperty({ example: '10001' })
  @IsNotEmpty()
  @IsString()
  postalCode: string;

  @ApiProperty({ example: 'USA' })
  @IsNotEmpty()
  @IsString()
  country: string;

  @ApiProperty({ example: '123-456-7890' })
  @IsNotEmpty()
  @IsString()
  phone: string;

  @ApiProperty({ example: 'tenant@example.com' })
  @IsNotEmpty()
  @IsEmail()
  email: string;

  @ApiPropertyOptional({ example: 'https://example.com' })
  @IsOptional()
  @IsUrl()
  website?: string;

  @ApiPropertyOptional({ example: 'default' })
  @IsOptional()
  @IsString()
  layout?: string;

  @ApiPropertyOptional({ example: '#FFFFFF' })
  @IsOptional()
  @IsString()
  primaryColor?: string;

  @ApiPropertyOptional({ example: '#000000' })
  @IsOptional()
  @IsString()
  secondaryColor?: string;

  @ApiPropertyOptional({ example: '#FF0000' })
  @IsOptional()
  @IsString()
  buttonHoverColor?: string;

  @ApiPropertyOptional({ example: '08:00' })
  @IsOptional()
  @IsString()
  openHours?: string;

  @ApiPropertyOptional({ example: '22:00' })
  @IsOptional()
  @IsString()
  closedHours?: string;

  @ApiPropertyOptional({ example: 'OPEN', description: 'OPEN or CLOSED' })
  @IsOptional()
  @IsString()
  status?: string;

  @ApiPropertyOptional({ example: 90, description: 'Stay duration in minutes' })
  @IsOptional()
  stayDuration?: number;

  @ApiPropertyOptional({ example: 'Syarat dan ketentuan reservasi...' })
  @IsOptional()
  @IsString()
  termsNConditions?: string;

  @ApiPropertyOptional({ example: 'BCA' })
  @IsOptional()
  @IsString()
  bankType?: string;

  @ApiPropertyOptional({ example: 'Bank Central Asia' })
  @IsOptional()
  @IsString()
  bankName?: string;

  @ApiPropertyOptional({ example: 2 })
  @IsOptional()
  minimumPax?: number;

  @ApiPropertyOptional({ example: 100000 })
  @IsOptional()
  minimumDP?: number;

  @ApiPropertyOptional({ example: 50 })
  @IsOptional()
  minimumPercentage?: number;
}
