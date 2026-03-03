import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class CreateNewsTodayDto {
  @ApiProperty({ example: 'Breaking news: Today is a good day.' })
  @IsNotEmpty()
  @IsString()
  newsToday: string;
}
