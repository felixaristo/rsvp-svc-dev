import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, In } from 'typeorm';
import { CloseOut } from './entities/close-out.entity';
import { CreateCloseOutDto } from './dto/create-close-out.dto';
import { UpdateCloseOutDto } from './dto/update-close-out.dto';
import { Category } from '../table-categories/entities/category.entity';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class CloseOutService {
  constructor(
    @InjectRepository(CloseOut)
    private readonly repo: Repository<CloseOut>,
    @InjectRepository(Category)
    private readonly categoryRepo: Repository<Category>,
    @InjectRepository(Branch)
    private readonly branchRepo: Repository<Branch>,
  ) {}

  async create(createDto: CreateCloseOutDto) {
    const categories = await this.categoryRepo.findBy({ id: In(createDto.categoryIds) });
    if (categories.length !== createDto.categoryIds.length) {
      throw new NotFoundException('Some categories not found');
    }

    const branchId = createDto.branchId || 1;
    const branch = await this.branchRepo.findOne({ where: { id: branchId } });
    if (!branch) throw new NotFoundException(`Branch with ID ${branchId} not found`);

    const entity = this.repo.create({
      ...createDto,
      categories,
      branch,
    });

    return this.repo.save(entity) as any as CloseOut;
  }

  async findAll(page = 1, limit = 10) {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;

    const [items, total] = await this.repo.findAndCount({
      relations: ['categories', 'branch'],
      skip,
      take,
      order: { id: 'DESC' },
    });

    return { items, total, page: p, limit: take };
  }

  async findOne(id: number) {
    const item = await this.repo.findOne({
      where: { id },
      relations: ['categories', 'branch'],
    });
    if (!item) throw new NotFoundException(`CloseOut with ID ${id} not found`);
    return item;
  }

  async update(id: number, updateDto: UpdateCloseOutDto) {
    const item = await this.findOne(id);

    if (updateDto.categoryIds) {
      const categories = await this.categoryRepo.findBy({ id: In(updateDto.categoryIds) });
      if (categories.length !== updateDto.categoryIds.length) {
        throw new NotFoundException('Some categories not found');
      }
      item.categories = categories;
    }

    if (updateDto.branchId) {
      const branch = await this.branchRepo.findOne({ where: { id: updateDto.branchId } });
      if (!branch) throw new NotFoundException(`Branch with ID ${updateDto.branchId} not found`);
      item.branch = branch;
    }

    Object.assign(item, updateDto);
    return this.repo.save(item) as any as CloseOut;
  }

  async remove(id: number) {
    const item = await this.findOne(id);
    return this.repo.softRemove(item);
  }
}
