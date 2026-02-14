import { Injectable, Logger } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, MoreThanOrEqual } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';
import { SocialMediaService } from '../social-media/social-media.service';

@Injectable()
export class PromotionService {
  private readonly logger = new Logger(PromotionService.name);

  constructor(
    @InjectRepository(Promotion)
    private readonly repo: Repository<Promotion>,
    private readonly socialMediaService: SocialMediaService,
    private readonly configService: ConfigService,
  ) {}

  async create(dto: CreatePromotionDto, photoPath: string): Promise<Promotion> {
    const entity = this.repo.create({
      title: dto.title,
      description: dto.description,
      photo: photoPath,
      fromDate: new Date(dto.from_date),
      toDate: new Date(dto.to_date),
    });
    const saved = await this.repo.save(entity);

    // Attempt to post to Instagram
    // const appBaseUrl = this.configService.get<string>('APP_BASE_URL', '');
    // if (appBaseUrl && photoPath) {
    //   // Ensure appBaseUrl doesn't have a trailing slash if we're adding one, or handle it cleanly
    //   const baseUrl = appBaseUrl.endsWith('/') ? appBaseUrl.slice(0, -1) : appBaseUrl;
    //   const publicImageUrl = `${baseUrl}/${photoPath}`;
      
    //   const caption = `${dto.title}\n\n${dto.description}\n\nValid until: ${new Date(dto.to_date).toLocaleDateString()}`;
      
    //   this.socialMediaService.postToInstagram(publicImageUrl, caption)
    //     .catch(err => this.logger.error('Background Instagram post failed', err));
    // }

    return saved;
  }

  async findActive(): Promise<Promotion[]> {
    return this.repo.find({
      where: {
        toDate: MoreThanOrEqual(new Date()),
      },
      order: { id: 'DESC' },
    });
  }

  async findAll(page = 1, limit = 10): Promise<{ items: Promotion[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const [items, total] = await this.repo.findAndCount({ skip, take, order: { id: 'DESC' } });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<Promotion | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdatePromotionDto, photoPath?: string): Promise<Promotion | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    if (dto.title !== undefined) entity.title = dto.title;
    if (dto.description !== undefined) entity.description = dto.description;
    if (dto.from_date !== undefined) entity.fromDate = new Date(dto.from_date);
    if (dto.to_date !== undefined) entity.toDate = new Date(dto.to_date);
    if (photoPath) entity.photo = photoPath;
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return !!result.affected;
  }
}
