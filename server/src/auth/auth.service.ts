import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service.js'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { ResetToken, ResetTokenDocument } from './schemas/reset-token.schema.js'
import { VerificationCode, VerificationCodeDocument } from './schemas/verification-code.schema.js'
import { randomToken, sha256 } from '../common/utils/crypto.js'
import { EmailService } from '../common/email/email.service.js'

@Injectable()
export class AuthService {
  constructor(
    private readonly users: UsersService,
    private readonly jwt: JwtService,
    @InjectModel(ResetToken.name) private readonly resetModel: Model<ResetTokenDocument>,
    private readonly email: EmailService,
    @InjectModel(VerificationCode.name) private readonly verifModel: Model<VerificationCodeDocument>,
  ) {}

  async register(data: { name: string; email: string; password: string }) {
    const user = await this.users.create(data)
    try {
      await this.issueAndSendVerification(user._id.toString(), user.email)
    } catch (err) {
      console.error('[Auth] Failed to issue/send verification:', err)
      // No bloqueamos el registro: el usuario puede solicitar reenvío
    }
    return { ok: true, email: user.email, requiresVerification: true }
  }

  async login(email: string, password: string) {
    const user = await this.users.validateUser(email, password)
    if (!user) throw new UnauthorizedException('Invalid credentials')
    if (!user.isVerified) throw new UnauthorizedException('Email not verified')
    const token = await this.signToken(user._id.toString(), user.email)
    return { user, accessToken: token }
  }

  private async signToken(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email })
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email)
    if (!user) {
      // No revelar si existe o no
      return { ok: true }
    }
    // Clean previous tokens for this user
    await this.resetModel.deleteMany({ userId: user._id })
    const token = randomToken(32)
    const tokenHash = sha256(token)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1h
    await this.resetModel.create({ userId: user._id, tokenHash, expiresAt })

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`
    await this.email.sendPasswordReset(user.email, resetUrl)

    const isProd = process.env.NODE_ENV === 'production'
    return { ok: true, ...(isProd ? {} : { devToken: token, resetUrl }) }
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token) throw new BadRequestException('Missing token')
    const tokenHash = sha256(token)
    const doc = await this.resetModel.findOne({ tokenHash, used: false })
    if (!doc || doc.expiresAt.getTime() < Date.now()) throw new NotFoundException('Invalid token')
    // Update user password
    const user = await this.users.findByEmail((await (this.users as any).userModel.findById(doc.userId).lean()).email)
    if (!user) throw new NotFoundException('User not found')
    // set new password
    await (this.users as any).userModel.updateOne({ _id: doc.userId }, { $set: { passwordHash: await (await import('bcryptjs')).hash(newPassword, 10) } })
    // mark token used
    doc.used = true
    await doc.save()
    return { ok: true }
  }

  private async issueAndSendVerification(userId: string, email: string) {
    // delete previous codes
    await this.verifModel.deleteMany({ userId })
    const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit
    const codeHash = sha256(code)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15) // 15 min
    await this.verifModel.create({ userId, codeHash, expiresAt })
    const verifyUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`
    await this.email.sendEmailVerificationCode(email, code, verifyUrl)
    return code
  }

  async verifyEmail(email: string, code: string) {
    const user = await this.users.findByEmail(email)
    if (!user) throw new NotFoundException('User not found')
    const doc = await this.verifModel.findOne({ userId: user._id, used: false })
    if (!doc || doc.expiresAt.getTime() < Date.now()) throw new NotFoundException('Invalid or expired code')
    if (sha256(code) !== doc.codeHash) throw new UnauthorizedException('Invalid code')
    // mark user verified
    await (this.users as any).userModel.updateOne({ _id: user._id }, { $set: { isVerified: true } })
    doc.used = true
    await doc.save()
    const token = await this.signToken(user._id.toString(), user.email)
    const fresh = await this.users.findByEmail(email)
    return { user: fresh, accessToken: token }
  }

  async resendVerification(email: string) {
    const user = await this.users.findByEmail(email)
    if (!user) return { ok: true }
    if (user.isVerified) return { ok: true }
    await this.issueAndSendVerification(user._id.toString(), user.email)
    return { ok: true }
  }
}
