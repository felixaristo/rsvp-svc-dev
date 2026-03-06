import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { User } from '../users/entities/user.entity';
import { CreateRoleUserDto } from './dto/create-role-user.dto';
import { UpdateRoleUserDto } from './dto/update-role-user.dto';

@Injectable()
export class RolesService {
  constructor(
    @InjectRepository(User)
    private readonly repo: Repository<User>,
  ) {}

  async create(dto: CreateRoleUserDto): Promise<User> {
    const hashed = await bcrypt.hash(dto.password, 10);
    dto.branchId = dto.branchId ?? 1;
    const entity = this.repo.create({ username: dto.username, fullname: dto.fullname, password: hashed, role: dto.role, branch: { id: dto.branchId } });
    return this.repo.save(entity);
  }

  async findAll(page = 1, limit = 10): Promise<{ items: User[]; total: number; page: number; limit: number }> {
    const take = Math.max(1, Number(limit));
    const p = Math.max(1, Number(page));
    const skip = (p - 1) * take;
    const [items, total] = await this.repo.findAndCount({ skip, take, order: { id: 'DESC' } });
    return { items, total, page: p, limit: take };
  }

  async findOne(id: number): Promise<User | null> {
    return this.repo.findOne({ where: { id } });
  }

  async update(id: number, dto: UpdateRoleUserDto): Promise<User | null> {
    const entity = await this.findOne(id);
    if (!entity) return null;
    if (dto.username !== undefined) entity.username = dto.username;
    if (dto.fullname !== undefined) entity.fullname = dto.fullname;
    if (dto.role !== undefined) entity.role = dto.role;
    dto.branchId = dto.branchId ?? 1;
    if (dto.password !== undefined) {
      entity.password = await bcrypt.hash(dto.password, 10);
    }
    return this.repo.save(entity);
  }

  async remove(id: number): Promise<boolean> {
    const result = await this.repo.softDelete({ id });
    return !!result.affected;
  }
}
