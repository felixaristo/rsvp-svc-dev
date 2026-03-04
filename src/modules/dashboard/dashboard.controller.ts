import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { AuthGuard } from '@nestjs/passport';
import { DashboardService } from './dashboard.service';
import { GetDashboardSummaryDto } from './dto/get-dashboard-summary.dto';
import { GetDashboardBookingsByTimeDto } from './dto/get-dashboard-bookings-by-time.dto';

@ApiTags('Dashboard')
@ApiBearerAuth()
@UseGuards(AuthGuard('jwt'))
@Controller('dashboard')
export class DashboardController {
  constructor(private readonly dashboardService: DashboardService) {}

  @Get('summary')
  getSummary(@Query() filterDto: GetDashboardSummaryDto) {
    return this.dashboardService.getSummary(filterDto);
  }

  @Get('bookings-by-time')
  getBookingsByTime(@Query() query: GetDashboardBookingsByTimeDto) {
    return this.dashboardService.getBookingsByTime(query.fromDate, query.toDate);
  }
}
