import { Controller, Get, Post, Body, Patch, Param } from '@nestjs/common';
import { NewsTodayService } from './news-today.service';
import { CreateNewsTodayDto } from './dto/create-news-today.dto';
import { UpdateNewsTodayDto } from './dto/update-news-today.dto';
import { ApiTags } from '@nestjs/swagger';

@ApiTags('News Today')
@Controller('news-today')
export class NewsTodayController {
  constructor(private readonly newsTodayService: NewsTodayService) {}

  @Post()
  create(@Body() createNewsTodayDto: CreateNewsTodayDto) {
    return this.newsTodayService.create(createNewsTodayDto);
  }

  @Get()
  findToday() {
    return this.newsTodayService.findToday();
  }

  @Patch(':id')
  update(
    @Param('id') id: string,
    @Body() updateNewsTodayDto: UpdateNewsTodayDto,
  ) {
    return this.newsTodayService.update(+id, updateNewsTodayDto);
  }
}
