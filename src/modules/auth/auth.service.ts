import { Injectable, UnauthorizedException } from '@nestjs/common';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import * as fs from 'fs';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService
  ) {}

  async validateUser(username: string, pass: string): Promise<any> {
    const user = await this.usersService.findOne(username);
    if (user && !user.deletedAt && await bcrypt.compare(pass, user.password)) {
      const { password, ...result } = user;
      return result;
    }
    return null;
  }

  async login(user: any) {
    const payload = { username: user.username, sub: user.id };
    return {
      profile: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        role: user.role,
      },
      token:{
        access_token: this.jwtService.sign(payload),
        refresh_token: 123
      }
    };
  }

  async register(userDto: any) {
    try {
      const hashedPassword = await bcrypt.hash(userDto.password, 10);
      return await this.usersService.create({
        ...userDto,
        password: hashedPassword,
      });
    } catch (error) {
      require('fs').writeFileSync('error.log', JSON.stringify(error, Object.getOwnPropertyNames(error), 2));
      console.error('Registration error:', error);
      throw error;
    }
  }
}
