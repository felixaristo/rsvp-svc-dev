import { PartialType } from '@nestjs/swagger';
import { CreateCloseOutDto } from './create-close-out.dto';

export class UpdateCloseOutDto extends PartialType(CreateCloseOutDto) {}
