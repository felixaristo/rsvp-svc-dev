import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UploadedFile, UseInterceptors, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiConsumes, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import * as fs from 'fs';
import * as path from 'path';
import { TenantService } from './tenant.service';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';
import { KeepNulls } from '../../common/decorators/keep-nulls.decorator';

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

@ApiTags('Tenant')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('tenant')
export class TenantController {
  constructor(private readonly tenantService: TenantService) {}

  // @Post()
  // @ApiConsumes('multipart/form-data')
  // @UseInterceptors(
  //   FileInterceptor('logo', {
  //     storage: diskStorage({
  //       destination: (req, file, cb) => {
  //         const dest = path.join(process.cwd(), 'uploads', 'tenants');
  //         ensureDir(dest);
  //         cb(null, dest);
  //       },
  //       filename: filenameGenerator,
  //     }),
  //   }),
  // )
  // create(@UploadedFile() file: any, @Body() createTenantDto: CreateTenantDto) {
  //   const logoPath = file ? path.relative(process.cwd(), file.path) : undefined;
  //   return this.tenantService.create(createTenantDto, logoPath);
  // }

  @Get('style/:id')
  @KeepNulls()
  findStyle(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.findStyle(id);
  }

  // @Get(':page/:limit')
  // @ApiParam({ name: 'page', required: true, type: Number })
  // @ApiParam({ name: 'limit', required: true, type: Number })
  // findAll(
  //   @Param('page', ParseIntPipe) page: number,
  //   @Param('limit', ParseIntPipe) limit: number,
  // ) {
  //   return this.tenantService.findAll(page, limit);
  // }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.tenantService.findOne(id);
  }

  @Patch(':id')
  @ApiConsumes('multipart/form-data')
  @UseInterceptors(
    FileInterceptor('logo', {
      storage: diskStorage({
        destination: (req, file, cb) => {
          const dest = path.join(process.cwd(), 'uploads', 'tenants');
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
    @Body() updateTenantDto: UpdateTenantDto,
  ) {
    const logoPath = file ? path.relative(process.cwd(), file.path) : undefined;
    return this.tenantService.update(id, updateTenantDto, logoPath);
  } 

  // @Delete(':id')
  // remove(@Param('id', ParseIntPipe) id: number) {
  //   return this.tenantService.remove(id);
  // }
}
