import Joi from 'joi'

export const envValidationSchema = Joi.object({
  PORT: Joi.number().default(4000),
  MONGODB_URI: Joi.string().uri().required(),
  JWT_SECRET: Joi.string().min(16).required(),
  JWT_EXPIRES_IN: Joi.string().default('30m'),
  FRONTEND_URL: Joi.string().uri().default('http://localhost:3000'),
  SENDGRID_API_KEY: Joi.string().optional().allow(''),
  SENDGRID_FROM: Joi.string().optional().allow(''),
})

