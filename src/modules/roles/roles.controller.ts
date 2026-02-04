import { Controller, Get, Post, Body, Param, Patch, Delete, ParseIntPipe, UseGuards } from '@nestjs/common';
import { ApiTags, ApiBody, ApiParam, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { RolesService } from './roles.service';
import { CreateRoleUserDto } from './dto/create-role-user.dto';
import { UpdateRoleUserDto } from './dto/update-role-user.dto';

@ApiTags('Roles Management')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('roles-management')
export class RolesController {
  constructor(private readonly service: RolesService) {}

  @Post()
  @ApiBody({ type: CreateRoleUserDto })
  create(@Body() dto: CreateRoleUserDto) {
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
  @ApiBody({ type: UpdateRoleUserDto })
  update(@Param('id', ParseIntPipe) id: number, @Body() dto: UpdateRoleUserDto) {
    return this.service.update(id, dto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.service.remove(id);
  }
}
