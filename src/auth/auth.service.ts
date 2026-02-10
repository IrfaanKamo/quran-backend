import {
  ForbiddenException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import * as bcrypt from 'bcrypt';
import { UsersService } from '../users/users.service';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private usersService: UsersService,
    private jwtService: JwtService,
  ) {}

  async login(username: string, pass: string) {
    const user = await this.usersService.findByUsername(username);
    if (!user) throw new UnauthorizedException();

    const isMatch = await bcrypt.compare(pass, user.passwordHash);
    if (!isMatch) throw new UnauthorizedException();

    const tokens = await this.getTokens(user._id.toString(), user.username);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async refreshTokens(userId: string, rt: string) {
    const user = await this.usersService.findById(userId);
    if (!user || !user.refreshToken)
      throw new ForbiddenException('Access Denied');

    if (rt !== user.refreshToken)
      throw new UnauthorizedException();

    const tokens = await this.getTokens(user._id.toString(), user.username);
    await this.updateRefreshToken(user._id.toString(), tokens.refreshToken);
    return tokens;
  }

  async updateRefreshToken(userId: string, refreshToken: string) {
    await this.usersService.update(userId, { refreshToken });
  }

  async getTokens(userId: string, username: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, username },
        {
          secret: process.env.JWT_ACCESS_SECRET,
          expiresIn: '15m',
        },
      ),
      this.jwtService.signAsync(
        { sub: userId, username },
        {
          secret: process.env.JWT_REFRESH_SECRET,
          expiresIn: '7d',
        },
      ),
    ]);
    return { accessToken: at, refreshToken: rt };
  }

  async logout(userId: string) {
    return await this.usersService.update(userId, {
      refreshToken: null,
    });
  }
}
