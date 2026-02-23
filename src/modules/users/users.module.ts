import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { User } from './entities/user.entity';
import { Branch } from '../branch/entities/branch.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Branch])],
  providers: [UsersService],
  exports: [UsersService],
})
export class UsersModule {}
