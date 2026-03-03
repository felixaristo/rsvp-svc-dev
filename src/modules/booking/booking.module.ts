import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BookingService } from './booking.service';
import { BookingController } from './booking.controller';
import { Booking } from './entities/booking.entity';
import { CustomerModule } from '../customer/customer.module';
import { Customer } from '../customer/entities/customer.entity';
import { Table } from '../table-management/entities/table.entity';
import { Menu } from '../menu-management/entities/menu.entity';
import { Branch } from '../branch/entities/branch.entity';
import { TenantModule } from '../tenant/tenant.module';
import { CloseOut } from '../close-out/entities/close-out.entity';
import { Category } from '../table-categories/entities/category.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      Booking,
      Customer,
      Table,
      Menu,
      Branch,
      CloseOut,
      Category,
    ]),
    CustomerModule,
    TenantModule,
  ],
  controllers: [BookingController],
  providers: [BookingService],
  exports: [BookingService],
})
export class BookingModule {}
