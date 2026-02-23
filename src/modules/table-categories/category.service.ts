import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Category } from './entities/category.entity';
import { CreateCategoryDto } from './dto/create-category.dto';
import { UpdateCategoryDto } from './dto/update-category.dto';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class CategoryService {
  constructor(
    @InjectRepository(Category)
    private readonly repo: Repository<Category>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(dto: CreateCategoryDto): Promise<Category> {
    const effectiveBranchId = dto.branchId ?? 1;
    const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
    }

    const { branchId, ...rest } = dto as any;

    const entity = this.repo.create({
      ...rest,
      branch,
    });
    return this.repo.save(entity as any);
  }

  async findAll(page = 1, limit = 10): Promise<{ items: Category[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      skip,
      take,
      order: { id: 'DESC' },
      relations: ['branch'],
    });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<Category | null> {
    return this.repo.findOne({
      where: { id },
      relations: ['branch'],
    });
  }

  async update(id: number, dto: UpdateCategoryDto): Promise<Category | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    if (dto.branchId !== undefined) {
      const effectiveBranchId = dto.branchId ?? 1;
      const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
      }
      (entity as any).branch = branch;
    }

    const { branchId, ...rest } = dto as any;
    Object.assign(entity, rest);
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return result.affected ? true : false;
  }
}
