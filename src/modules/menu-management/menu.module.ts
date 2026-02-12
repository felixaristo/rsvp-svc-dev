import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { MenuService } from './menu.service';
import { MenuController } from './menu.controller';
import { Menu } from './entities/menu.entity';
import { MenuCategoryModule } from '../menu-categories/menu-category.module';

@Module({
  imports: [
    TypeOrmModule.forFeature([Menu]),
    MenuCategoryModule,
  ],
  controllers: [MenuController],
  providers: [MenuService],
  exports: [MenuService],
})
export class MenuModule {}
