import { Controller, Get, Post, Body, UseGuards, UploadedFile, UseInterceptors } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiHeader, ApiOperation, ApiConsumes, ApiBody } from '@nestjs/swagger';
import { MicrositeService } from './microsite.service';
import { CreateMicrositeBookingDto } from './dto/create-microsite-booking.dto';
import { PublicApiKeyGuard } from '../../common/guards/public-api-key.guard';
import { diskStorage } from 'multer';
import { extname } from 'path';
import * as path from 'path';

@ApiTags('Microsite')
@ApiHeader({
  name: 'x-api-key',
  description: 'API Key for public access',
  required: true,
})
@UseGuards(PublicApiKeyGuard)
@Controller('microsite')
export class MicrositeController {
  constructor(private readonly micrositeService: MicrositeService) {}

  @Post('booking')
  createBooking(@Body() createBookingDto: CreateMicrositeBookingDto) {
    return this.micrositeService.createBooking(createBookingDto);
  }

  @Get('settings')
  getRestaurantSettings() {
    return this.micrositeService.getRestaurantSettings();
  }
}
