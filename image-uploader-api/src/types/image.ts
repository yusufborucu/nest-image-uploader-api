import { Document } from 'mongoose';
import { User } from './user';

export interface Image extends Document {
  owner: User;
  link: string;
  note: string;
  createdAt: Date;
}