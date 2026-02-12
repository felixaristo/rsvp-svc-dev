import { Module } from '@nestjs/common';
import { MicrositeService } from './microsite.service';
import { MicrositeController } from './microsite.controller';
import { BookingModule } from '../booking/booking.module';
import { TenantModule } from '../tenant/tenant.module';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from '../customer/customer.module';
import { PromotionModule } from '../promotion/promotion.module';
import { MenuModule } from '../menu-management/menu.module';
import { MenuCategoryModule } from '../menu-categories/menu-category.module';

@Module({
  imports: [BookingModule, TenantModule, ConfigModule, CustomerModule, PromotionModule, MenuModule, MenuCategoryModule],
  controllers: [MicrositeController],
  providers: [MicrositeService],
})
export class MicrositeModule {}
