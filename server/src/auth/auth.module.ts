import { Module } from '@nestjs/common'
import { JwtModule } from '@nestjs/jwt'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { UsersModule } from '../users/users.module.js'
import { AuthService } from './auth.service.js'
import { AuthController } from './auth.controller.js'
import { MongooseModule } from '@nestjs/mongoose'
import { ResetToken, ResetTokenSchema } from './schemas/reset-token.schema.js'
import { VerificationCode, VerificationCodeSchema } from './schemas/verification-code.schema.js'
import { EmailModule } from '../common/email/email.module.js'

@Module({
  imports: [
    UsersModule,
    ConfigModule,
    MongooseModule.forFeature([
      { name: ResetToken.name, schema: ResetTokenSchema },
      { name: VerificationCode.name, schema: VerificationCodeSchema },
    ]),
    EmailModule,
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET') ?? 'dev-secret',
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') ?? '30m' }
      })
    })
  ],
  providers: [AuthService],
  controllers: [AuthController]
})
export class AuthModule {}
