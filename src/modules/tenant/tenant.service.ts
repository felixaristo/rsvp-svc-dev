import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Tenant } from './entities/tenant.entity';
import { CreateTenantDto } from './dto/create-tenant.dto';
import { UpdateTenantDto } from './dto/update-tenant.dto';

@Injectable()
export class TenantService {
  constructor(
    @InjectRepository(Tenant)
    private readonly tenantRepository: Repository<Tenant>,
  ) {}

  async create(createTenantDto: CreateTenantDto, logoPath?: string): Promise<Tenant> {
    const tenant = this.tenantRepository.create({
      ...createTenantDto,
      logo: logoPath,
    });
    return await this.tenantRepository.save(tenant);
  }

  async findAll(page: number, limit: number): Promise<{ data: Tenant[]; total: number; page: number; limit: number }> {
    const [data, total] = await this.tenantRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
    });

    return {
      data,
      total,
      page,
      limit,
    };
  }

  async findOne(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({ where: { id } });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async findStyle(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      select: ['id', 'primaryColor', 'secondaryColor', 'buttonHoverColor'],
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async forMicrosite(id: number): Promise<Tenant> {
    const tenant = await this.tenantRepository.findOne({
      where: { id },
      select: ['id', 'primaryColor', 'secondaryColor', 'buttonHoverColor', 'logo', 'name', 'description', 'address', 'phone', 'email', 'website', 'layout', 'openHours', 'closedHours', 'status', 'stayDuration', 'accountNumber'],
    });
    if (!tenant) {
      throw new NotFoundException(`Tenant with ID ${id} not found`);
    }
    return tenant;
  }

  async update(id: number, updateTenantDto: UpdateTenantDto, logoPath?: string): Promise<Tenant> {
    const tenant = await this.findOne(id);
    const updatedTenant = {
      ...tenant,
      ...updateTenantDto,
      ...(logoPath && { logo: logoPath }),
    };
    return await this.tenantRepository.save(updatedTenant);
  }

  async remove(id: number): Promise<void> {
    const tenant = await this.findOne(id);
    await this.tenantRepository.softRemove(tenant);
  }
}
