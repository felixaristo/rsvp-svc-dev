import { PartialType } from '@nestjs/swagger';
import { CreateNewsTodayDto } from './create-news-today.dto';

export class UpdateNewsTodayDto extends PartialType(CreateNewsTodayDto) {}
