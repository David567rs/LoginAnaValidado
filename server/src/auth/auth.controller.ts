import { Body, Controller, Get, Post, Req, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import { CreateUserDto } from '../users/dto/create-user.dto.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { UsersService } from '../users/users.service.js'

class ForgotDto { @IsEmail() email!: string }
class ResetDto { @IsNotEmpty() token!: string; @MinLength(8) newPassword!: string }
class VerifyEmailDto { @IsEmail() email!: string; @IsNotEmpty() code!: string }
class ResendVerifyDto { @IsEmail() email!: string }

@Controller('auth')
export class AuthController {
  constructor(private readonly auth: AuthService, private readonly users: UsersService) {}

  @Post('register')
  register(@Body() dto: CreateUserDto) {
    return this.auth.register(dto)
  }

  @Post('login')
  login(@Body() dto: LoginDto) {
    return this.auth.login(dto.email, dto.password)
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req: any) {
    const email = req.user?.email
    if (!email) return req.user
    const user = await this.users.findByEmail(String(email))
    if (!user) return req.user
    return user
  }

  @Post('forgot-password')
  forgot(@Body() dto: ForgotDto) {
    return this.auth.requestPasswordReset(dto.email)
  }

  @Post('reset-password')
  reset(@Body() dto: ResetDto) {
    return this.auth.resetPassword(dto.token, dto.newPassword)
  }

  @Post('verify-email')
  verify(@Body() dto: VerifyEmailDto) {
    return this.auth.verifyEmail(dto.email, dto.code)
  }

  @Post('resend-verification')
  resend(@Body() dto: ResendVerifyDto) {
    return this.auth.resendVerification(dto.email)
  }
}
