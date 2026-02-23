import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { BranchController } from './branch.controller';
import { BranchService } from './branch.service';
import { Branch } from './entities/branch.entity';
import { Tenant } from '../tenant/entities/tenant.entity';

@Module({
  imports: [TypeOrmModule.forFeature([Branch, Tenant])],
  controllers: [BranchController],
  providers: [BranchService],
})
export class BranchModule {}
