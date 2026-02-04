import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiConsumes, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { PromotionService } from './promotion.service';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

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

@ApiTags('Promotion')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('promotion')
export class PromotionController {
  constructor(private readonly service: PromotionService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        from_date: { type: 'string', format: 'date-time' },
        to_date: { type: 'string', format: 'date-time' },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['title', 'description', 'from_date', 'to_date', 'photo'],
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'promotions');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  create(@UploadedFile() file: any, @Body() dto: CreatePromotionDto) {
    const photoPath = file ? path.relative(process.cwd(), file.path) : '';
    return this.service.create(dto, photoPath);
  }

  @Get(':page/:limit')
  @ApiParam({ name: 'page', required: true })
  @ApiParam({ name: 'limit', required: true })
  findAll(@Param('page', ParseIntPipe) page: number, @Param('limit', ParseIntPipe) limit: number) {
    return this.service.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.service.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        description: { type: 'string' },
        from_date: { type: 'string', format: 'date-time' },
        to_date: { type: 'string', format: 'date-time' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'promotions');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  update(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any, @Body() dto: UpdatePromotionDto) {
    const photoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.service.update(id, dto, photoPath);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
