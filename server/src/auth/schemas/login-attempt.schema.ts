import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument } from 'mongoose'

export type LoginAttemptDocument = HydratedDocument<LoginAttempt>

@Schema({ timestamps: true })
export class LoginAttempt {
  @Prop({ required: true, unique: true, lowercase: true, trim: true })
  email!: string

  @Prop({ type: Number, default: 0 })
  attempts!: number

  @Prop({ type: Date, default: null })
  lockUntil!: Date | null

  @Prop({ type: Number, default: 0 }) // 0: next lock 1 min, 1: next lock 15 min
  tier!: number
}

export const LoginAttemptSchema = SchemaFactory.createForClass(LoginAttempt)
