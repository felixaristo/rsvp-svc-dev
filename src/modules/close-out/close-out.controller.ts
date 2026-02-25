import { Controller, Get, Post, Body, Patch, Param, Delete, ParseIntPipe, UseGuards, Query } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth, ApiParam } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { CloseOutService } from './close-out.service';
import { CreateCloseOutDto } from './dto/create-close-out.dto';
import { UpdateCloseOutDto } from './dto/update-close-out.dto';

@ApiTags('Close Out')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('close-out')
export class CloseOutController {
  constructor(private readonly closeOutService: CloseOutService) {}

  @Post()
  create(@Body() createCloseOutDto: CreateCloseOutDto) {
    console.log(createCloseOutDto);
    return this.closeOutService.create(createCloseOutDto);
  }

  @Get(':page/:limit')
  @ApiParam({ name: 'page', required: true })
  @ApiParam({ name: 'limit', required: true })
  findAll(
    @Param('page', ParseIntPipe) page: number,
    @Param('limit', ParseIntPipe) limit: number,
  ) {
    return this.closeOutService.findAll(page, limit);
  }

  @Get(':id')
  findOne(@Param('id', ParseIntPipe) id: number) {
    return this.closeOutService.findOne(id);
  }

  @Patch(':id')
  update(
    @Param('id', ParseIntPipe) id: number,
    @Body() updateCloseOutDto: UpdateCloseOutDto,
  ) {
    return this.closeOutService.update(id, updateCloseOutDto);
  }

  @Delete(':id')
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.closeOutService.remove(id);
  }
}
