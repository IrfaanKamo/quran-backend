import {
  Injectable,
  ConflictException,
  UnauthorizedException,
} from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User, UserDocument } from './schemas/user.schema';
import { CreateUserDto } from './dto/create-user.dto';
import { UpdateUserDto } from './dto/update-user.dto';

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

      return this.userWihtoutSensitiveFields(createdUser);
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

  async findById(id: string): Promise<UserDocument | null> {
    return this.userModel.findById(id).exec();
  }

  async findByUsername(username: string): Promise<UserDocument | null> {
    return this.userModel.findOne({ username }).exec();
  }

  async update(
    id: string,
    { newPassword, currentPassword, ...fields }: UpdateUserDto,
  ): Promise<UserDocument | null> {
    if (newPassword) {
      if (!currentPassword) {
        throw new UnauthorizedException(
          'Current password is required to change password',
        );
      }

      const user = await this.userModel.findById(id).exec();
      if (!user) return null;

      const isPasswordValid = await bcrypt.compare(
        currentPassword,
        user.passwordHash,
      );
      if (!isPasswordValid) {
        throw new UnauthorizedException('Current password is incorrect');
      }

      (fields as any).passwordHash = await bcrypt.hash(newPassword, 10);
    }

    const updatedUser = await this.userModel
      .findByIdAndUpdate(id, fields, { new: true })
      .exec();

    if (!updatedUser) return null;

    return this.userWihtoutSensitiveFields(updatedUser);
  }

  userWihtoutSensitiveFields(user: any) {
    const userObject: any = user.toObject();

    delete userObject.passwordHash;
    delete userObject.refreshToken;

    return userObject;
  }
}
