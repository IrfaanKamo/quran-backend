import { Injectable, ConflictException } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectModel(User.name)
    private readonly userModel: Model<UserDocument>,
  ) {}

  async create(createUserDto: CreateUserDto) {
    const { username, email, password } = createUserDto;

    const passwordHash = await bcrypt.hash(password, 10);

    try {
      const createdUser = await this.userModel.create({
        username,
        email,
        passwordHash,
      });

      const userObject: any = createdUser.toObject();
      delete userObject.passwordHash;

      return userObject;
    } catch (error: any) {
      if (error.keyPattern.username) {
        throw new ConflictException({
          field: 'username',
          message: 'Username already exists',
        });
      }

      if (error.keyPattern.email) {
        throw new ConflictException({
          field: 'email',
          message: 'Email already exists',
        });
      }

      throw error;
    }
  }

  async findAll() {
    const users = await this.userModel.find().select('-passwordHash').exec();
    return users;
  }

  async findByEmail(email: string) {
    return this.userModel.findOne({ email }).exec();
  }

  async findByUsername(username: string) {
    return this.userModel.findOne({ username }).exec();
  }
}
