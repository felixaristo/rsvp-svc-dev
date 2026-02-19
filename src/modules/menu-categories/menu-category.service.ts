import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { MenuCategory } from './entities/menu-category.entity';
import { CreateMenuCategoryDto } from './dto/create-menu-category.dto';
import { UpdateMenuCategoryDto } from './dto/update-menu-category.dto';

@Injectable()
export class MenuCategoryService {
  constructor(
    @InjectRepository(MenuCategory)
    private repo: Repository<MenuCategory>,
  ) {}

  async create(createDto: CreateMenuCategoryDto): Promise<MenuCategory> {
    const category = this.repo.create(createDto);
    return this.repo.save(category);
  }

  async findAll(page: number, limit: number): Promise<{ items: MenuCategory[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      take,
      skip,
      order: { id: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async getAll(): Promise<MenuCategory[]> {
    return this.repo.find({ order: { id: 'DESC' } });
  }

  async findOne(id: number): Promise<MenuCategory> {
    const category = await this.repo.findOne({ where: { id } });
    if (!category) {
      throw new NotFoundException(`Menu Category with ID ${id} not found`);
    }
    return category;
  }

  async update(id: number, updateDto: UpdateMenuCategoryDto): Promise<MenuCategory> {
    const category = await this.findOne(id);
    this.repo.merge(category, updateDto);
    return this.repo.save(category);
  }

  async remove(id: number): Promise<void> {
    const category = await this.findOne(id);
    await this.repo.softRemove(category);
  }
}
