import { HttpException, HttpStatus, Injectable, Res } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Payload } from '../types/payload';
import { User } from '../types/user';
import { sign } from 'jsonwebtoken';
import { AuthDTO, ForgotDTO, ResetDTO } from './auth.dto';
import * as bcrypt from 'bcrypt';
import * as crypto from 'crypto';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';

@Injectable()
export class AuthService {
  constructor(
    @InjectModel('User') private userModel: Model<User>,
    @InjectQueue('message-queue') private queue: Queue
  ) {}
  
  async validateUser(payload: Payload) {
    const { email } = payload;
    return await this.userModel.findOne({ email });
  }

  async signPayload(payload: Payload) {
    return sign(payload, process.env.JWT_SECRET_KEY, { expiresIn: '1h' });
  }

  async findByLogin(authDTO: AuthDTO) {
    const { email, password } = authDTO;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
    
    if (await bcrypt.compare(password, user.password)) {
      return user;
    } else {
      throw new HttpException('Invalid credentials', HttpStatus.UNAUTHORIZED);
    }
  }

  async create(authDTO: AuthDTO) {
    const { email } = authDTO;
    const user = await this.userModel.findOne({ email });
    if (user) {
      throw new HttpException('User already exists', HttpStatus.BAD_REQUEST);
    }

    const createdUser = new this.userModel(authDTO);
    await createdUser.save();
    return createdUser;
  }

  async forgot(forgotDTO: ForgotDTO, @Res() response) {
    const { email } = forgotDTO;
    const user = await this.userModel.findOne({ email });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    let resetHash = crypto.randomBytes(20).toString('hex');
    await user.updateOne({ resetHash: resetHash });

    await this.queue.add('message-job', {
      email: email,
      resetHash: resetHash
    });

    return response.status(HttpStatus.OK).json({
      "message": "Reset password email sent",
      "resetHash": resetHash
    });
  }

  async reset(resetDTO: ResetDTO, @Res() response) {
    const { resetHash, password } = resetDTO;
    const user = await this.userModel.findOne({ resetHash: resetHash });
    if (!user) {
      throw new HttpException('User not found', HttpStatus.BAD_REQUEST);
    }

    const hashed = await bcrypt.hash(password, 10);
    await user.updateOne({ password: hashed, resetHash: null });

    return response.status(HttpStatus.OK).json({
      "message": "Your password changed successfully"
    });
  }
}
