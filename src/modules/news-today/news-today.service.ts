import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { CreateNewsTodayDto } from './dto/create-news-today.dto';
import { UpdateNewsTodayDto } from './dto/update-news-today.dto';
import { NewsToday } from './entities/news-today.entity';

@Injectable()
export class NewsTodayService {
  constructor(
    @InjectRepository(NewsToday)
    private readonly newsTodayRepository: Repository<NewsToday>,
  ) {}

  async create(createNewsTodayDto: CreateNewsTodayDto): Promise<NewsToday> {
    const news = this.newsTodayRepository.create(createNewsTodayDto);
    return this.newsTodayRepository.save(news);
  }

  async findToday(): Promise<NewsToday | null> {
    const start = new Date();
    start.setHours(0, 0, 0, 0);

    const end = new Date();
    end.setHours(23, 59, 59, 999);

    const news = await this.newsTodayRepository.findOne({
      where: {
        createdAt: Between(start, end),
      },
      order: {
        createdAt: 'DESC',
      },
    });

    return news;
  }

  async update(
    id: number,
    updateNewsTodayDto: UpdateNewsTodayDto,
  ): Promise<NewsToday> {
    const news = await this.newsTodayRepository.findOne({ where: { id } });
    if (!news) {
      throw new NotFoundException(`News with ID ${id} not found`);
    }
    Object.assign(news, updateNewsTodayDto);
    return this.newsTodayRepository.save(news);
  }
}
