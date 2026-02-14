import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Category } from '../table-categories/entities/category.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly repo: Repository<Table>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
  ) {}

  async create(dto: CreateTableDto): Promise<Table> {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const entity = this.repo.create({ number: dto.number, covers: dto.covers, category });
    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10): Promise<{ items: Table[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const [items, total] = await this.repo.findAndCount({ relations: ['category'], skip, take, order: { id: 'DESC' } });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<Table | null> {
    return this.repo.findOne({ where: { id }, relations: ['category'] });
  }

  async update(id: number, dto: UpdateTableDto): Promise<Table | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    if (dto.number !== undefined) entity.number = dto.number;
    if (dto.covers !== undefined) entity.covers = dto.covers;
    if (dto.categoryId !== undefined) {
      const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
      if (!category) throw new NotFoundException('Category not found');
      entity.category = category;
    }
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return result.affected ? true : false;
  }
}
