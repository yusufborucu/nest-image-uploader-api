import { Body, Controller, Get, Post, Res, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { User } from '../utilities/user.decorator';
import { Payload } from '../types/payload';
import { AuthDTO, ForgotDTO, ResetDTO } from './auth.dto';
import { AuthService } from './auth.service';
import { User as UserDocument } from '../types/user';

@Controller('auth')
export class AuthController {
  constructor(private authService: AuthService) {}

  @Post('login')
  async login(@Body() authDTO: AuthDTO) {
    const user = await this.authService.findByLogin(authDTO);
    const payload: Payload = {
      email: user.email
    };

    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

  @Post('register')
  async register(@Body() authDTO: AuthDTO) {
    const user = await this.authService.create(authDTO);
    const payload: Payload = {
      email: user.email
    };

    const token = await this.authService.signPayload(payload);
    return { user, token };
  }

  @Get()
  @UseGuards(AuthGuard('jwt'))
  async tokenTest(@User() user: UserDocument) {
    return user;
  }

  @Post('forgot_password')
  async forgot(@Body() forgotDTO: ForgotDTO, @Res() response) {
    return await this.authService.forgot(forgotDTO, response);
  }

  @Post('reset_password')
  async reset(@Body() resetDTO: ResetDTO, @Res() response) {
    return await this.authService.reset(resetDTO, response);
  }
}
