import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Menu } from './entities/menu.entity';
import { CreateMenuDto } from './dto/create-menu.dto';
import { UpdateMenuDto } from './dto/update-menu.dto';
import { MenuCategoryService } from '../menu-categories/menu-category.service';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class MenuService {
  constructor(
    @InjectRepository(Menu)
    private repo: Repository<Menu>,
    @InjectRepository(Branch)
    private branchRepo: Repository<Branch>,
    private categoryService: MenuCategoryService,
  ) {}

  async create(createDto: CreateMenuDto, photoFilename?: string): Promise<Menu> {
    const category = await this.categoryService.findOne(createDto.categoryId);
    const effectiveBranchId = createDto.branchId ?? 1;
    const branch = await this.branchRepo.findOne({ where: { id: effectiveBranchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
    }

    const { branchId, ...rest } = createDto as any;

    const menu = this.repo.create({
      ...rest,
      photo: photoFilename,
      category,
      branch,
    });
    
    return this.repo.save(menu as any);
  }

  async findAll(
    page: number,
    limit: number,
    categoryId?: number,
    search?: string,
  ): Promise<{ items: Menu[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const where: any = {};

    if (categoryId) {
      where.category = { id: categoryId };
    }

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    const [items, total] = await this.repo.findAndCount({
      relations: ['category', 'branch'],
      where,
      take,
      skip,
      order: { id: 'DESC' },
    });
    return { items, total, page, limit };
  }

  async findAllActive(): Promise<Menu[]> {
    return this.repo.find({
      relations: ['category', 'branch'],
      order: { category: { name: 'ASC' }, name: 'ASC' },
    });
  }

  async findByCategory(categoryId: number, page: number, limit: number): Promise<{ items: Menu[]; total: number; page: number; limit: number }> {
    const take = limit;
    const skip = (page - 1) * take;
    const [items, total] = await this.repo.findAndCount({
      where: { category: { id: categoryId }, status: true },
      relations: ['category', 'branch'],
      take,
      skip,
      order: { name: 'ASC' },
    });
    return { items, total, page, limit };
  }

  async findOne(id: number): Promise<Menu> {
    const menu = await this.repo.findOne({ 
      where: { id },
      relations: ['category', 'branch']
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

  async updateStatus(id: number, status: boolean): Promise<Menu> {
    const menu = await this.findOne(id);
    menu.status = status;
    return this.repo.save(menu);
  }

  async remove(id: number): Promise<void> {
    const menu = await this.findOne(id);
    await this.repo.softRemove(menu);
  }
}
