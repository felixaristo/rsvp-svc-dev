import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CloseOutService } from './close-out.service';
import { CloseOutController } from './close-out.controller';
import { CloseOut } from './entities/close-out.entity';
import { Category } from '../table-categories/entities/category.entity';
import { Branch } from '../branch/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CloseOut, Category, Branch])],
  controllers: [CloseOutController],
  providers: [CloseOutService],
})
export class CloseOutModule {}
