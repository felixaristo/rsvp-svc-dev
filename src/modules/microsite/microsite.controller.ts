import { Controller, Get, Post, Body, UseGuards, UploadedFile, UseInterceptors, Query } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiHeader, ApiOperation, ApiConsumes, ApiBody, ApiQuery } from '@nestjs/swagger';
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

  @Get('promotions')
  @ApiOperation({ summary: 'Get active promotions' })
  getPromotions() {
    return this.micrositeService.getPromotions();
  }

  @Get('menu-categories')
  @ApiOperation({ summary: 'Get all menu categories' })
  getMenuCategories() {
    return this.micrositeService.getMenuCategories();
  }

  @Get('menus')
  @ApiOperation({ summary: 'Get menus by category' })
  @ApiQuery({ name: 'categoryId', required: true, type: Number })
  @ApiQuery({ name: 'page', required: false, type: Number })
  @ApiQuery({ name: 'limit', required: false, type: Number })
  getMenus(
    @Query('categoryId') categoryId: number,
    @Query('page') page: number = 1,
    @Query('limit') limit: number = 10,
  ) {
    return this.micrositeService.getMenus(categoryId, page, limit);
  }
}
