import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { HydratedDocument, Types } from 'mongoose'

export type VerificationCodeDocument = HydratedDocument<VerificationCode>

@Schema({ timestamps: true })
export class VerificationCode {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId

  @Prop({ required: true, index: true })
  codeHash!: string

  @Prop({ required: true, index: true })
  expiresAt!: Date

  @Prop({ default: false })
  used!: boolean
}

export const VerificationCodeSchema = SchemaFactory.createForClass(VerificationCode)

