import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuCategoryService } from './menu-category.service';
import { MenuCategoryController } from './menu-category.controller';
import { MenuCategory } from './entities/menu-category.entity';
import { Branch } from '../branch/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([MenuCategory, Branch])],
  controllers: [MenuCategoryController],
  providers: [MenuCategoryService],
  exports: [MenuCategoryService], // Export service to be used in Menu Management
})
export class MenuCategoryModule {}
