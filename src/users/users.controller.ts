import { Controller, Get, Post, Body } from '@nestjs/common';
import { UsersService } from './users.service';
import { CreateUserDto } from './dto/create-user.dto';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Post()
  async create(@Body() createUserDto: CreateUserDto) {
    return this.usersService.create(createUserDto);
  }

  @Get()
  async findAll() {
    return this.usersService.findAll();
  }

  @Get('by-email')
  async findByEmail(email: string) {
    return this.usersService.findByEmail(email);
  }

  @Get('by-username')
  async findByUsername(username: string) {
    return this.usersService.findByUsername(username);
  }
}
