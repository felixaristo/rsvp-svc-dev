import { BasicStrategy as Strategy } from 'passport-http';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class BasicStrategy extends PassportStrategy(Strategy) {
  constructor(private configService: ConfigService) {
    super();
  }

  async validate(username: string, pass: string): Promise<any> {
    const envUser = this.configService.get<string>('BASIC_USERNAME') ?? 'basic';
    const envPass = this.configService.get<string>('BASIC_PASSWORD') ?? 'basic';
    if (username !== envUser || pass !== envPass) {
      throw new UnauthorizedException();
    }
    return { basic: true };
  }
}
