import { Body, Controller, Get, Post, Query, Req, Res, UseGuards } from '@nestjs/common'
import { AuthService } from './auth.service.js'
import { LoginDto } from './dto/login.dto.js'
import { CreateUserDto } from '../users/dto/create-user.dto.js'
import { JwtAuthGuard } from '../common/guards/jwt-auth.guard.js'
import { IsEmail, IsNotEmpty, MinLength } from 'class-validator'
import { UsersService } from '../users/users.service.js'
import { AuthGuard } from '@nestjs/passport'
import type { Response } from 'express'

class ForgotDto { @IsEmail() email!: string }
class ResetDto { @IsNotEmpty() token!: string; @MinLength(8) newPassword!: string }
class VerifyEmailDto { @IsEmail() email!: string; @IsNotEmpty() code!: string }
class ResendVerifyDto { @IsEmail() email!: string }
class EmailAvailableQuery { @IsEmail() email!: string }

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

  @Get('email-available')
  async emailAvailable(@Query() query: EmailAvailableQuery) {
    const exists = await this.users.findByEmail(query.email.toLowerCase().trim())
    return { available: !exists }
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth() {
    return
  }

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(@Req() req: any, @Res() res: Response) {
    const result = await this.auth.loginWithGoogle(req.user)
    const frontend = process.env.FRONTEND_URL || 'http://localhost:3000'
    const redirectUrl = `${frontend}/auth/google/callback?token=${encodeURIComponent(result.accessToken)}`
    return res.redirect(redirectUrl)
  }
}
