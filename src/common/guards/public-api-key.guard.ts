import { Injectable, CanActivate, ExecutionContext, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PublicApiKeyGuard implements CanActivate {
  constructor(private configService: ConfigService) {}

  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const apiKey = request.headers['x-api-key'];
    const validApiKey = this.configService.get<string>('MICROSITE_API_KEY');

    if (!validApiKey) {
        // If API key is not configured in env, fail secure or allow all? 
        // Best to fail secure, but for dev let's log warning.
        console.warn('MICROSITE_API_KEY is not set in environment variables.');
        return false;
    }

    if (apiKey !== validApiKey) {
      throw new UnauthorizedException('Invalid API Key');
    }

    return true;
  }
}
