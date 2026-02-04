import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { MenuService } from './menu.service';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';

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

@ApiTags('Menu Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('menu-management')
export class MenuController {
  constructor(private readonly service: MenuService) {}

  @Post()
  @ApiConsumes('multipart/form-data')
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'number' },
        photo: { type: 'string', format: 'binary' },
      },
      required: ['name', 'price', 'categoryId'],
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'menus');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  create(@UploadedFile() file: any, @Body() createDto: CreateMenuDto) {
    const photoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.service.create(createDto, photoPath);
  }

  @Get(':page/:limit')
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
        name: { type: 'string' },
        description: { type: 'string' },
        price: { type: 'number' },
        categoryId: { type: 'number' },
        photo: { type: 'string', format: 'binary' },
      },
    },
  })
  @UseInterceptors(
    FileInterceptor('photo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'menus');
          ensureDir(dest);
          cb(null, dest);
        },
        filename: filenameGenerator,
      }),
    }),
  )
  update(@Param('id', ParseIntPipe) id: number, @UploadedFile() file: any, @Body() updateDto: UpdateMenuDto) {
    const photoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.service.update(id, updateDto, photoPath);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
