import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, ILike, Between, MoreThanOrEqual, LessThanOrEqual } from 'typeorm';
import { Customer } from './entities/customer.entity';
import { Booking } from '../booking/entities/booking.entity';
import { Branch } from '../branch/entities/branch.entity';
import { CreateCustomerDto } from './dto/create-customer.dto';
import { UpdateCustomerDto } from './dto/update-customer.dto';
import { GetCustomersFilterDto } from './dto/get-customers-filter.dto';

@Injectable()
export class CustomerService {
  constructor(
    @InjectRepository(Customer)
    private readonly customerRepository: Repository<Customer>,
    @InjectRepository(Booking)
    private readonly bookingRepository: Repository<Booking>,
    @InjectRepository(Branch)
    private readonly branchRepository: Repository<Branch>,
  ) {}

  async create(createCustomerDto: CreateCustomerDto): Promise<Customer> {
    const effectiveBranchId = createCustomerDto.branchId ?? 1;
    const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
    if (!branch) {
      throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
    }

    const { branchId, ...rest } = createCustomerDto as any;

    const customer = this.customerRepository.create({
      ...rest,
      branch,
    });
    return await this.customerRepository.save(customer as any);
  }

  async findAll(page: number, limit: number, filterDto?: GetCustomersFilterDto): Promise<{ items: Customer[]; total: number; page: number; limit: number }> {
    const { search, fromDate, toDate } = filterDto || {};
    const where: any = {};
    
    if (search) {
      where.fullname = ILike(`%${search}%`);
    }

    if (fromDate && toDate) {
      where.createdAt = Between(fromDate, toDate);
    } else if (fromDate) {
      where.createdAt = MoreThanOrEqual(fromDate);
    } else if (toDate) {
      where.createdAt = LessThanOrEqual(toDate);
    }

    const [items, total] = await this.customerRepository.findAndCount({
      skip: (page - 1) * limit,
      take: limit,
      order: {
        id: 'DESC',
      },
      where,
      relations: ['branch'],
    });

    const enrichedItems = items.map(async customer => ({
      ...customer,
      visit_time: await this.bookingRepository.count({
        where: { customer: { id: customer.id } },
      })
    }));

    return {
      items: await Promise.all(enrichedItems),
      total,
      page,
      limit
    };
  }

  async findOne(id: number): Promise<Customer> {
    const customer = await this.customerRepository.findOne({
      where: { id },
      relations: ['branch'],
    });
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

  async findBookings(customerId: number, page: number, limit: number): Promise<{ items: Booking[]; total: number; page: number; limit: number }> {
    // Ensure customer exists
    await this.findOne(customerId);

    const [items, total] = await this.bookingRepository.findAndCount({
      where: { customer: { id: customerId } },
      skip: (page - 1) * limit,
      take: limit,
      relations: ['tables', 'bookingMenus', 'bookingMenus.menu'],
      order: {
        date: 'DESC',
        time: 'DESC',
      },
    });

    return {
      items,
      total,
      page,
      limit,
    };
  }

  async update(id: number, updateCustomerDto: UpdateCustomerDto): Promise<Customer> {
    const customer = await this.findOne(id);

    if (updateCustomerDto.branchId !== undefined) {
      const effectiveBranchId = updateCustomerDto.branchId ?? 1;
      const branch = await this.branchRepository.findOne({ where: { id: effectiveBranchId } });
      if (!branch) {
        throw new NotFoundException(`Branch with ID ${effectiveBranchId} not found`);
      }
      (customer as any).branch = branch;
    }

    const { branchId, ...rest } = updateCustomerDto as any;
    const updatedCustomer = Object.assign(customer, rest);
    return await this.customerRepository.save(updatedCustomer);
  }

  async remove(id: number): Promise<void> {
    const customer = await this.findOne(id);
    await this.customerRepository.softRemove(customer);
  }
}
