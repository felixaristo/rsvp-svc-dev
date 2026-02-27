import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UploadedFile, UseInterceptors, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth, ApiQuery } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { BookingService } from './booking.service';
import { CreateBookingDto } from './dto/create-booking.dto';
import { UpdateBookingDto } from './dto/update-booking.dto';
import { GetBookingsFilterDto } from './dto/get-bookings-filter.dto';

function ensureDir(dir: string) {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
}

function filenameGenerator(_req: any, file: any, cb: (error: Error | null, filename: string) => void) {
  const ext = path.extname(file.originalname);
  const base = path.basename(file.originalname, ext).replace(/\s+/g, '_');
  cb(null, `${base}_${Date.now()}${ext}`);
}

@ApiTags('Booking')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('booking')
export class BookingController {
  constructor(private readonly bookingService: BookingService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('downpaymentProof', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'bookings');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  create(@UploadedFile() file: any, @Body() createBookingDto: CreateBookingDto) {
    console.log('Controller received DTO:', JSON.stringify(createBookingDto));
    const photoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.bookingService.create(createBookingDto, photoPath);
  }

  @Get('available-table-categories')
  @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'time', required: true, type: String, description: 'HH:mm' })
  getAvailableTableCategories(@Query('date') date: string, @Query('time') time: string) {
    return this.bookingService.getAvailableTableCategories(date, time);
  }

  @Get('available-tables')
  @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
  @ApiQuery({ name: 'time', required: true, type: String, description: 'HH:mm' })
  @ApiQuery({ name: 'categoryId', required: true, type: Number })
  @ApiQuery({ name: 'bookingId', required: false, type: Number })
  getAvailableTables(
    @Query('date') date: string,
    @Query('time') time: string,
    @Query('categoryId', ParseIntPipe) categoryId: number,
    @Query('bookingId') bookingId?: number
  ) {
    const parsedBookingId = bookingId ? parseInt(bookingId.toString()) : undefined;
    return this.bookingService.getAvailableTablesByCategory(date, time, categoryId, parsedBookingId);
  }

  @Get(':page/:limit')
  @ApiParam({ name: 'page', required: true, type: Number })
  @ApiParam({ name: 'limit', required: true, type: Number })
  findAll(
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
    @Query() filterDto: GetBookingsFilterDto,
  ) {
    return this.bookingService.findAll(page, limit, filterDto);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('downpaymentProof', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'bookings');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  update(
    @Param('id', ParseIntPipe) id: number,
    @UploadedFile() file: any,
    @Body() updateBookingDto: UpdateBookingDto,
  ) {
    const photoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.bookingService.update(id, updateBookingDto, photoPath);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.bookingService.remove(id);
  }

  @Get('available-time-slots')
  @ApiQuery({ name: 'date', required: true, type: String, description: 'YYYY-MM-DD' })
  getAvailableTimeSlots(@Query('date') date: string) {
    return this.bookingService.getAvailableTimeSlots(date);
  }
}
