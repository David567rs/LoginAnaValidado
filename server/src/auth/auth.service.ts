import { Injectable, UnauthorizedException, NotFoundException, BadRequestException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'
import { UsersService } from '../users/users.service.js'
import { InjectModel } from '@nestjs/mongoose'
import { Model, Types } from 'mongoose'
import { ResetToken, ResetTokenDocument } from './schemas/reset-token.schema.js'
import { VerificationCode, VerificationCodeDocument } from './schemas/verification-code.schema.js'
import { randomToken, sha256 } from '../common/utils/crypto.js'
import { EmailService } from '../common/email/email.service.js'
import bcrypt from 'bcryptjs'

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
    if (!user) throw new UnauthorizedException('credenciales invalidas')
    if (!user.isVerified) throw new UnauthorizedException('Email no verificado')
    const token = await this.signToken(user._id.toString(), user.email)
    return { user, accessToken: token }
  }

  private async signToken(sub: string, email: string) {
    return this.jwt.signAsync({ sub, email })
  }

  async loginWithGoogle(profile: { email?: string | null; name?: string | null }) {
    if (!profile.email) throw new UnauthorizedException('No email from Google')
    const user = await this.users.findOrCreateOAuthUser(profile.name || '', profile.email)
    const token = await this.signToken((user as any)._id?.toString?.() || String((user as any)._id), user.email)
    return { user, accessToken: token }
  }

  async requestPasswordReset(email: string) {
    const user = await this.users.findByEmail(email.toLowerCase().trim())
    if (!user) throw new NotFoundException('El correo no se encuentra registrado')
    await this.resetModel.deleteMany({ expiresAt: { $lt: new Date() } })
    await this.resetModel.deleteMany({ userId: user._id })
    const token = randomToken(32)
    const tokenHash = sha256(token)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 60) // 1h
    await this.resetModel.create({ userId: user._id, tokenHash, expiresAt })

    const resetUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/reset-password?token=${token}`
    await this.email.sendPasswordReset(user.email, resetUrl, token)

    const isProd = process.env.NODE_ENV === 'production'
    return { ok: true, ...(isProd ? {} : { devToken: token, resetUrl }) }
  }

  async resetPassword(token: string, newPassword: string) {
    if (!token) throw new BadRequestException('Missing token')
    const tokenHash = sha256(token)
    const doc = await this.resetModel.findOne({ tokenHash, used: false })
    if (!doc || doc.expiresAt.getTime() < Date.now()) throw new NotFoundException('Invalid token')
    // Update user password
    const userDoc = await (this.users as any).userModel.findById(doc.userId).lean()
    if (!userDoc) throw new NotFoundException('User not found')
    const isSame = await bcrypt.compare(newPassword, userDoc.passwordHash)
    if (isSame) throw new BadRequestException('New password must be different from the current one')
    const user = await this.users.findByEmail(userDoc.email)
    if (!user) throw new NotFoundException('User not found')
    // set new password
    const passwordHash = await bcrypt.hash(newPassword, 10)
    await (this.users as any).userModel.updateOne({ _id: doc.userId }, { $set: { passwordHash } })
    // mark token used
    doc.used = true
    await doc.save()
    return { ok: true }
  }

  private async issueAndSendVerification(userId: string, email: string) {
    // delete previous codes
    const uid = new Types.ObjectId(userId)
    await this.verifModel.deleteMany({ expiresAt: { $lt: new Date() } })
    await this.verifModel.deleteMany({ userId: uid })
    const code = Math.floor(100000 + Math.random() * 900000).toString() // 6-digit
    const codeHash = sha256(code)
    const expiresAt = new Date(Date.now() + 1000 * 60 * 15) // 15 min
    const created = await this.verifModel.create({ userId: uid, codeHash, expiresAt })
    if (process.env.DEBUG_VERIFICATION === 'true') {
      // eslint-disable-next-line no-console
      console.log('[Verify][issue]', { email, code, codeHash: codeHash.slice(0, 8), expiresAt, docId: created._id.toString() })
    }
    const verifyUrl = `${process.env.FRONTEND_URL ?? 'http://localhost:3000'}/auth/verify-email?email=${encodeURIComponent(email)}&code=${code}`
    await this.email.sendEmailVerificationCode(email, code, verifyUrl)
    return code
  }

  async verifyEmail(email: string, code: string) {
    const normalizedEmail = email.toLowerCase().trim()
    const user = await this.users.findByEmail(normalizedEmail)
    if (!user) throw new NotFoundException('User not found')

    const codeHash = sha256(code.trim())
    const uid = new Types.ObjectId(String((user as any)._id))
    // Buscar exactamente el código enviado y vigente
    let doc = await this.verifModel.findOne({ userId: uid, codeHash, used: false })
    if (process.env.DEBUG_VERIFICATION === 'true') {
      console.log('[Verify][attempt]', { email: normalizedEmail, code, codeHash: codeHash.slice(0, 8) })
    }
    // Fallback: tomar el último código vigente del usuario y validar hash (por si hay replicas/latencias)
    if (!doc) {
      // Fallback: si por algún motivo no coincide el tipo de userId, probamos con string y el último emitido
      const latest = await this.verifModel
        .findOne({ userId: uid, used: false })
        .sort({ createdAt: -1 })
      if (latest && latest.expiresAt.getTime() >= Date.now() && latest.codeHash === codeHash) {
        doc = latest
      }
      if (!doc) {
        const latestStr = await this.verifModel
          .findOne({ userId: String(uid), used: false })
          .sort({ createdAt: -1 })
        if (latestStr && latestStr.expiresAt.getTime() >= Date.now() && latestStr.codeHash === codeHash) {
          doc = latestStr
        }
      }
    }
    if (!doc || doc.expiresAt.getTime() < Date.now()) {
      throw new NotFoundException('Invalid or expired code')
    }
    // mark user verified
    await (this.users as any).userModel.updateOne({ _id: user._id }, { $set: { isVerified: true } })
    doc.used = true
    await doc.save()
    if (process.env.DEBUG_VERIFICATION === 'true') {
      console.log('[Verify][success]', { email: normalizedEmail })
    }
    const token = await this.signToken(user._id.toString(), user.email)
    const fresh = await this.users.findByEmail(normalizedEmail)
    return { user: fresh, accessToken: token }
  }

  async resendVerification(email: string) {
    const user = await this.users.findByEmail(email.toLowerCase().trim())
    if (!user) return { ok: true }
    if (user.isVerified) return { ok: true }
    await this.issueAndSendVerification(user._id.toString(), user.email)
    return { ok: true }
  }
}
