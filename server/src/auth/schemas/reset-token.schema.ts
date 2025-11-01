import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose'
import { Types, HydratedDocument } from 'mongoose'

export type ResetTokenDocument = HydratedDocument<ResetToken>

@Schema({ timestamps: true })
export class ResetToken {
  @Prop({ type: Types.ObjectId, ref: 'User', required: true })
  userId!: Types.ObjectId

  @Prop({ required: true, index: true })
  tokenHash!: string

  @Prop({ required: true, index: true })
  expiresAt!: Date

  @Prop({ default: false })
  used!: boolean
}

export const ResetTokenSchema = SchemaFactory.createForClass(ResetToken)

