import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { CreateBranchDto } from './dto/create-branch.dto';
import { UpdateBranchDto } from './dto/update-branch.dto';
import { Branch } from './entities/branch.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Injectable()
export class BranchService {
  constructor(
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createBranchDto: CreateBranchDto): Promise<Branch> {
    const tenant = await this.tenantRepository.findOne({ where: { id: createBranchDto.tenantId } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${createBranchDto.tenantId} not found`);
    }

    const branch = this.branchRepository.create({
      name: createBranchDto.name,
      address: createBranchDto.address,
      phone: createBranchDto.phone,
      tenant,
    });

    return this.branchRepository.save(branch);
  }

  async findAll(): Promise<Branch[]> {
    return this.branchRepository.find({
      relations: ['tenant'],
      order: { id: 'DESC' },
    });
  }

  async findOne(id: number): Promise<Branch> {
    const branch = await this.branchRepository.findOne({
      where: { id },
      relations: ['tenant'],
    });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${id} not found`);
    }
    return branch;
  }

  async update(id: number, updateBranchDto: UpdateBranchDto): Promise<Branch> {
    const branch = await this.findOne(id);

    if (updateBranchDto.tenantId) {
      const tenant = await this.tenantRepository.findOne({ where: { id: updateBranchDto.tenantId } });
      if (!tenant) {
        throw new NotFoundException(`Tenant with ID ${updateBranchDto.tenantId} not found`);
      }
      branch.tenant = tenant;
    }

    if (updateBranchDto.name !== undefined) {
      branch.name = updateBranchDto.name;
    }

    if (updateBranchDto.address !== undefined) {
      branch.address = updateBranchDto.address;
    }

    if (updateBranchDto.phone !== undefined) {
      branch.phone = updateBranchDto.phone;
    }

    return this.branchRepository.save(branch);
  }

  async remove(id: number): Promise<void> {
    const branch = await this.findOne(id);
    await this.branchRepository.softRemove(branch);
  }
}
