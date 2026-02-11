import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const customer = this.customerRepository.create(createCustomerDto);
    return await this.customerRepository.save(customer);
  }

  async findAll(page: number, limit: number, search?: string): Promise<{ items: Customer[]; total: number; page: number; limit: number }> {
    const where: any = {};
    if (search) {
      where.fullname = ILike(`%${search}%`);
    }

    const [items, total] = await this.customerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
      where,
    });

    const enrichedItems = items.map(customer => ({
      ...customer,
      visit_time: 5,
    }));

    return {
      items: enrichedItems,
      total,
      page,
      limit
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({ where: { id } });
    if (!customer) {
      throw new NotFoundException(`Customer with ID ${id} not found`);
    }
    return customer;
  }

  async findByPhoneOrInstagram(phone: string, instagram?: string): Promise<Customer | null> {
    const whereConditions: any[] = [{ phone }];
    
    if (instagram) {
      whereConditions.push({ instagram });
    }

    return await this.customerRepository.findOne({
      where: whereConditions
    });
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);
    const updatedCustomer = Object.assign(customer, updateCustomerDto);
    return await this.customerRepository.save(updatedCustomer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.softRemove(customer);
  }
}
