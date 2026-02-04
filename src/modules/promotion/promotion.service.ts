import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Promotion } from './entities/promotion.entity';
import { CreatePromotionDto } from './dto/create-promotion.dto';
import { UpdatePromotionDto } from './dto/update-promotion.dto';

@Injectable()
export class PromotionService {
  constructor(
    @InjectRepository(Promotion)
    private readonly repo: Repository<Promotion>,
  ) {}

  async create(dto: CreatePromotionDto, photoPath: string): Promise<Promotion> {
    const entity = this.repo.create({
      title: dto.title,
      description: dto.description,
      photo: photoPath,
      fromDate: new Date(dto.from_date),
      toDate: new Date(dto.to_date),
    });
    return this.repo.save(entity);
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
