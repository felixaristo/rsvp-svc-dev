import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiResponse, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { MenuCategoryService } from './menu-category.service';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@ApiTags('Menu Categories')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('menu-categories')
export class MenuCategoryController {
  constructor(private readonly service: MenuCategoryService) {}

  @Post()
  create(@Body() createDto: CreateMenuCategoryDto) {
    return this.service.create(createDto);
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
  
  update(@Param('id', ParseIntPipe) id: number, @Body() updateDto: UpdateMenuCategoryDto) {
    return this.service.update(id, updateDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
