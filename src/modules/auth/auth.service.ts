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
    const accessPayload = { username: user.username, sub: user.id };
    const refreshPayload = { sub: user.id };
    const accessToken = this.jwtService.sign(accessPayload);
    const refreshToken = this.jwtService.sign(refreshPayload, { expiresIn: '7d' });
    return {
      profile: {
        id: user.id,
        username: user.username,
        fullname: user.fullname,
        branchId: user.branch.id,
        role: user.role,
      },
      token:{
        access_token: accessToken,
        refresh_token: refreshToken
      }
    };
  }

  async refresh(refreshToken: string) {
    try {
      const payload = this.jwtService.verify(refreshToken);
      const user = await this.usersService.findById(payload.sub);
      if (!user || user.deletedAt) {
        throw new UnauthorizedException();
      }
      const { password, ...safeUser } = user as any;
      return this.login(safeUser);
    } catch (error) {
      throw new UnauthorizedException();
    }
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
