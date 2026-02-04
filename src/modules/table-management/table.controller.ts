import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { TableService } from './table.service';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';

@ApiTags('Table Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('table-management')
export class TableController {
  constructor(private readonly service: TableService) {}

  @Post()
  @ApiBody({ type: CreateTableDto })
  create(@Body() dto: CreateTableDto) {
    return this.service.create(dto);
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
  @ApiBody({ type: UpdateTableDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateTableDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
