import { Body, Controller, Post, Res, UseGuards, Req } from '@nestjs/common';
import * as Express from 'express';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { AtGuard } from './guards/at.guard';
import { RtGuard } from './guards/rt.guard';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

@Post('login')
async login(
  @Body() loginDto: SignInDto,
  @Res({ passthrough: true }) res: Express.Response,
) {
  const tokens = await this.authService.login(
    loginDto.username, 
    loginDto.password
  );

  res.cookie('access_token', tokens.accessToken, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'strict' 
  });
  
  res.cookie('refresh_token', tokens.refreshToken, { 
    httpOnly: true, 
    secure: true, 
    sameSite: 'strict', 
    path: '/auth/refresh' 
  });

  return { 
    message: 'Login successful',
    user: { username: loginDto.username } 
  };
}

  @UseGuards(RtGuard)
  @Post('refresh')
  async refresh(
    @Req() req: any,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const tokens = await this.authService.refreshTokens(
      req.user.sub,
      req.user.refreshToken,
    );

    res.cookie('access_token', tokens.accessToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
    });
    res.cookie('refresh_token', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      path: '/auth/refresh',
    });

    return { status: 'OK' };
  }

  @Post('logout')
  @UseGuards(AtGuard)
  async logout(
    @Req() req: any,
    @Res({ passthrough: true }) res: Express.Response,
  ) {
    const userId = req.user.sub;

    await this.authService.logout(userId);
    res.clearCookie('access_token');
    res.clearCookie('refresh_token', { path: '/auth/refresh' });

    return { message: 'Logged out successfully' };
  }
}
