import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type UserDocument = User & Document;

@Schema({
  timestamps: true,
})
export class User {
  @Prop({ required: true, unique: true })
  username: string;

  @Prop({ required: true, unique: true, index: true })
  email: string;

  @Prop()
  passwordHash: string;

  @Prop()
  refreshToken: string | null;
}

export const UserSchema = SchemaFactory.createForClass(User);
