import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuCategoryService } from '../menu-categories/menu-category.service';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private repo: Repository<Menu>,
    private categoryService: MenuCategoryService,
  ) {}

  async create(createDto: CreateMenuDto, photoFilename?: string): Promise<Menu> {
    const category = await this.categoryService.findOne(createDto.categoryId);
    
    const menu = this.repo.create({
      ...createDto,
      photo: photoFilename,
      category,
    });
    
    return this.repo.save(menu);
  }

  async findAll(page: number, limit: number): Promise<{ items: Menu[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      relations: ['category'],
      take,
      skip,
      order: { id: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async findAllActive(): Promise<Menu[]> {
    return this.repo.find({
      relations: ['category'],
      order: { category: { name: 'ASC' }, name: 'ASC' },
    });
  }

  async findByCategory(categoryId: number, page: number, limit: number): Promise<{ items: Menu[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      where: { category: { id: categoryId } },
      relations: ['category'],
      take,
      skip,
      order: { name: 'ASC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.repo.findOne({ 
      where: { id },
      relations: ['category']
    });
    
    if (!menu) {
      throw new NotFoundException(`Menu with ID ${id} not found`);
    }
    return menu;
  }

  async update(id: number, updateDto: UpdateMenuDto, photoFilename?: string): Promise<Menu> {
    const menu = await this.findOne(id);
    
    if (updateDto.categoryId) {
      const category = await this.categoryService.findOne(updateDto.categoryId);
      menu.category = category;
    }

    if (photoFilename) {
      menu.photo = photoFilename;
    }

    this.repo.merge(menu, updateDto);
    return this.repo.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.repo.softRemove(menu);
  }
}
