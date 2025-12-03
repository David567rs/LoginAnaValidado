import { Injectable, ConflictException, NotFoundException } from '@nestjs/common'
import { InjectModel } from '@nestjs/mongoose'
import { Model } from 'mongoose'
import { User, UserDocument } from './schemas/user.schema.js'
import { CreateUserDto } from './dto/create-user.dto.js'
import bcrypt from 'bcryptjs'
import { randomToken } from '../common/utils/crypto.js'

@Injectable()
export class UsersService {
  constructor(@InjectModel(User.name) private readonly userModel: Model<UserDocument>) {}

  async create(dto: CreateUserDto): Promise<Omit<User, 'passwordHash'> & { _id: any }> {
    const exists = await this.userModel.exists({ email: dto.email })
    if (exists) throw new ConflictException('Email already in use')
    const passwordHash = await bcrypt.hash(dto.password, 10)
    const created = await this.userModel.create({ name: dto.name, email: dto.email, passwordHash })
    const obj = created.toObject()
    // @ts-expect-error remove hash
    delete obj.passwordHash
    return obj as any
  }

  async findByEmail(email: string) {
    const user = await this.userModel.findOne({ email: email.toLowerCase().trim() }).lean()
    return user
  }

  async validateUser(email: string, password: string) {
    const user = await this.userModel.findOne({ email })
    if (!user) return null
    const ok = await bcrypt.compare(password, user.passwordHash)
    if (!ok) return null
    const obj = user.toObject()
    // @ts-expect-error remove hash
    delete obj.passwordHash
    return obj
  }

  async findOrCreateOAuthUser(name: string, email: string) {
    const normalizedEmail = email.toLowerCase().trim()
    let user = await this.userModel.findOne({ email: normalizedEmail })
    if (!user) {
      const passwordHash = await bcrypt.hash(randomToken(12), 10)
      user = await this.userModel.create({
        name: name || normalizedEmail.split('@')[0],
        email: normalizedEmail,
        passwordHash,
        isVerified: true
      })
    }
    const obj = user.toObject()
    // @ts-expect-error remove hash
    delete obj.passwordHash
    return obj
  }
}
