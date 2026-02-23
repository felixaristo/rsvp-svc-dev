import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Promotion } from './entities/promotion.entity';
import { PromotionService } from './promotion.service';
import { PromotionController } from './promotion.controller';
import { SocialMediaModule } from '../social-media/social-media.module';
import { ConfigModule } from '@nestjs/config';
import { Branch } from '../branch/entities/branch.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([Promotion, Branch]),
    SocialMediaModule,
    ConfigModule,
  ],
  providers: [PromotionService],
  controllers: [PromotionController],
  exports: [PromotionService],
})
export class PromotionModule {}
