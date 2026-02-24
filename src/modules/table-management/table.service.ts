import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Table } from './entities/table.entity';
import { CreateTableDto } from './dto/create-table.dto';
import { UpdateTableDto } from './dto/update-table.dto';
import { Category } from '../table-categories/entities/category.entity';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class TableService {
  constructor(
    @InjectRepository(Table)
    private readonly repo: Repository<Table>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(dto: CreateTableDto): Promise<Table> {
    const category = await this.categoryRepo.findOne({ where: { id: dto.categoryId } });
    if (!category) throw new NotFoundException('Category not found');
    const effectiveBranchId = dto.branchId ?? 1;
    const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
    }

    const { branchId, ...rest } = dto as any;

    const entity = this.repo.create({
      ...rest,
      category,
      branch,
    });
    return this.repo.save(entity as any);
  }

  async findAll(page = 1, limit = 10, number?: string): Promise<{ items: Table[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const where: any = {};
    if (number) {
      where.number = number;
    }

    const [items, total] = await this.repo.findAndCount({
      relations: ['category', 'branch'],
      skip,
      take,
      where,
      order: { id: 'DESC' },
    });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<Table | null> {
    return this.repo.findOne({ where: { id }, relations: ['category', 'branch'] });
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
    if (dto.branchId !== undefined) {
      const effectiveBranchId = dto.branchId ?? 1;
      const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
      }
      (entity as any).branch = branch;
    }
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return result.affected ? true : false;
  }
}
