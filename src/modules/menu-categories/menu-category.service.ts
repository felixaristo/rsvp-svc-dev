import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectRepository(MenuCategory)
    private repo: Repository<MenuCategory>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
  ) {}

  async create(createDto: CreateMenuCategoryDto): Promise<MenuCategory> {
    const branchId = createDto.branchId ?? 1;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${branchId} not found`);
    }

    const category = this.repo.create({
      name: createDto.name,
      branch,
    });

    return this.repo.save(category);
  }

  async findAll(page: number, limit: number): Promise<{ items: MenuCategory[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      relations: ['branch'],
      take,
      skip,
      order: { id: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async getAll(): Promise<MenuCategory[]> {
    return this.repo.find({
      relations: ['branch'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<MenuCategory> {
    const category = await this.repo.findOne({
      where: { id },
      relations: ['branch'],
    });
    if (!category) {
      throw new NotFoundException(`Menu Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateDto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const category = await this.findOne(id);

    if (updateDto.branchId !== undefined) {
      const branchId = updateDto.branchId ?? 1;
      const branch = await this.branchRepo.findOne({ where: { id: branchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${branchId} not found`);
      }
      category.branch = branch;
    }

    if (updateDto.name !== undefined) {
      category.name = updateDto.name;
    }

    return this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.softRemove(category);
  }
}
