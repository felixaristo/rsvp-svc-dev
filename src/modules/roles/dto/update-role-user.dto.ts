import { PartialType } from '@nestjs/swagger';
import { CreateRoleUserDto } from './create-role-user.dto';

export class UpdateRoleUserDto extends PartialType(CreateRoleUserDto) {}
