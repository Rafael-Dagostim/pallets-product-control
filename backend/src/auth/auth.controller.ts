import { Body, Controller, Post } from '@nestjs/common';
import { IsPublic } from '@shared/decorators';
import { AuthService } from './auth.service';
import { LoginDto } from './dto/login.dto';

@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @IsPublic()
  login(@Body() dto: LoginDto) {
    return this.authService.login(dto);
  }
}
