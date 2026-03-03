import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule } from '@nestjs/config';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './modules/users/users.module';
import { AuthModule } from './modules/auth/auth.module';
import { User } from './modules/users/entities/user.entity';
import { Category } from './modules/table-categories/entities/category.entity';
import { Table } from './modules/table-management/entities/table.entity';
import { Promotion } from './modules/promotion/entities/promotion.entity';
import { CategoryModule } from './modules/table-categories/category.module';
import { TableModule } from './modules/table-management/table.module';
import { PromotionModule } from './modules/promotion/promotion.module';
import { RolesModule } from './modules/roles/roles.module';
import { MenuCategoryModule } from './modules/menu-categories/menu-category.module';
import { MenuModule } from './modules/menu-management/menu.module';
import { MenuCategory } from './modules/menu-categories/entities/menu-category.entity';
import { Menu } from './modules/menu-management/entities/menu.entity';
import { CustomerModule } from './modules/customer/customer.module';
import { Customer } from './modules/customer/entities/customer.entity';
import { BookingModule } from './modules/booking/booking.module';
import { Booking } from './modules/booking/entities/booking.entity';
import { BookingMenu } from './modules/booking/entities/booking-menu.entity';
import { TenantModule } from './modules/tenant/tenant.module';
import { Tenant } from './modules/tenant/entities/tenant.entity';
import { Branch } from './modules/branch/entities/branch.entity';
import { MicrositeModule } from './modules/microsite/microsite.module';
import { DashboardModule } from './modules/dashboard/dashboard.module';
import { BranchModule } from './modules/branch/branch.module';
import { CloseOutModule } from './modules/close-out/close-out.module';
import { CloseOut } from './modules/close-out/entities/close-out.entity';
import { NewsToday } from './modules/news-today/entities/news-today.entity';
import { NewsTodayModule } from './modules/news-today/news-today.module';

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true }),
    TypeOrmModule.forRoot({
      type: 'postgres',
      host: process.env.DB_HOST || 'localhost',
      port: parseInt(process.env.DB_PORT || '5432', 10),
      username: process.env.DB_USERNAME ?? 'postgres',
      password: process.env.DB_PASSWORD ?? 'postgres',
      database: process.env.DB_NAME || 'rsvp_db',
      entities: [User, Category, Table, Promotion, MenuCategory, Menu, Customer, Booking, BookingMenu, Tenant, Branch, CloseOut, NewsToday],
      synchronize: true,
    }),
    UsersModule,
    AuthModule,
    CategoryModule,
    TableModule,
    PromotionModule,
    RolesModule,
    MenuCategoryModule,
    MenuModule,
    CustomerModule,
    BookingModule,
    TenantModule,
    MicrositeModule,
    DashboardModule,
    BranchModule,
    CloseOutModule,
    NewsTodayModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
