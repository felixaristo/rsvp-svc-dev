import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { NewsTodayService } from './news-today.service';
import { NewsTodayController } from './news-today.controller';
import { NewsToday } from './entities/news-today.entity';

@Module({
  imports: [TypeOrmModule.forFeature([NewsToday])],
  controllers: [NewsTodayController],
  providers: [NewsTodayService],
})
export class NewsTodayModule {}
