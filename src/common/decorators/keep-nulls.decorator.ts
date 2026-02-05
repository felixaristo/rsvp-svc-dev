import { SetMetadata } from '@nestjs/common';

export const KEEP_NULLS_KEY = 'keepNulls';
export const KeepNulls = () => SetMetadata(KEEP_NULLS_KEY, true);
