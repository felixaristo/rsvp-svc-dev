import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const entity = this.repo.create(dto);
    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10): Promise<{ items: Category[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const [items, total] = await this.repo.findAndCount({ skip, take, order: { id: 'DESC' } });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<Category | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    Object.assign(entity, dto);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return result.affected ? true : false;
  }
}
