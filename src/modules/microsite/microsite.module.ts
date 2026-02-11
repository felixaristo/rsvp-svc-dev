import { Module } from '@nestjs/common';
import { MicrositeService } from './microsite.service';
import { MicrositeController } from './microsite.controller';
import { BookingModule } from '../booking/booking.module';
import { TenantModule } from '../tenant/tenant.module';
import { ConfigModule } from '@nestjs/config';
import { CustomerModule } from '../customer/customer.module';

@Module({
  imports: [BookingModule, TenantModule, ConfigModule, CustomerModule],
  controllers: [MicrositeController],
  providers: [MicrositeService],
})
export class MicrositeModule {}
