import { Injectable, BadRequestException } from '@nestjs/common';
import { BookingService } from '../booking/booking.service';
import { TenantService } from '../tenant/tenant.service';
import { CustomerService } from '../customer/customer.service';
import { PromotionService } from '../promotion/promotion.service';
import { MenuService } from '../menu-management/menu.service';
import { MenuCategoryService } from '../menu-categories/menu-category.service';
import { CreateMicrositeBookingDto } from './dto/create-microsite-booking.dto';
import { CreateBookingDto } from '../booking/dto/create-booking.dto';

@Injectable()
export class MicrositeService {
  constructor(
    private readonly bookingService: BookingService,
    private readonly tenantService: TenantService,
    private readonly customerService: CustomerService,
    private readonly promotionService: PromotionService,
    private readonly menuService: MenuService,
    private readonly menuCategoryService: MenuCategoryService,
  ) {}

  async createBooking(createMicrositeBookingDto: CreateMicrositeBookingDto, photoPath?: string) {
    // Look up existing customer by phone or instagram
    const existingCustomer = await this.customerService.findByPhoneOrInstagram(
      createMicrositeBookingDto.customerPhone,
      createMicrositeBookingDto.customerInstagram
    );

    let customerId: number;

    if (existingCustomer) {
      customerId = existingCustomer.id;
    } else {
      // Create new customer if not found
      const newCustomer = await this.customerService.create({
        fullname: createMicrositeBookingDto.customerName,
        phone: createMicrositeBookingDto.customerPhone,
        email: createMicrositeBookingDto.customerEmail,
        instagram: createMicrositeBookingDto.customerInstagram,
      });
      customerId = newCustomer.id;
    }

    // Prepare CreateBookingDto
    const createBookingDto: CreateBookingDto = {
      ...createMicrositeBookingDto,
      customerId: customerId,
    };

    return this.bookingService.create(createBookingDto, photoPath);
  }

  async getRestaurantSettings() {
    // Assuming we want the settings for the first/default tenant, or we could pass an ID.
    // For now, let's assume tenant ID 1 is the main restaurant.
    return this.tenantService.forMicrosite(1);
  }

  async getPromotions() {
    return this.promotionService.findActive();
  }

  async getMenuCategories() {
    return this.menuCategoryService.getAll();
  }

  async getMenus(categoryId: number, page: number = 1, limit: number = 10) {
    return this.menuService.findByCategory(categoryId, page, limit);
  }

  async getAvailableTimeSlots(date: string) {
    return this.bookingService.getAvailableTimeSlots(date);
  }

  async getAvailableTableCategories(date: string, time: string) {
    return this.bookingService.getAvailableTableCategories(date, time);
  }
}
