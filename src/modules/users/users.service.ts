import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from './entities/user.entity';
import { Branch } from '../branch/entities/branch.entity';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async findOne(username: string): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { username },
      relations: ['branch'],
    });
  }

  async findById(id: number): Promise<User | null> {
    return this.usersRepository.findOne({
      where: { id },
      relations: ['branch'],
    });
  }

  async create(user: Partial<User> & { branchId?: number }): Promise<User> {
    const effectiveBranchId = user.branchId ?? 1;
    const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
    }

    const { branchId, ...rest } = user as any;

    const newUser = this.usersRepository.create({
      ...rest,
      branch,
    });
    return this.usersRepository.save(newUser as any);
  }
}
