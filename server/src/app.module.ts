import { Module } from '@nestjs/common'
import { ConfigModule, ConfigService } from '@nestjs/config'
import { MongooseModule } from '@nestjs/mongoose'
import { AppController } from './controllers/app.controller.js'
import { envValidationSchema } from './config/env.validation.js'
import { UsersModule } from './users/users.module.js'
import { AuthModule } from './auth/auth.module.js'

@Module({
  imports: [
    ConfigModule.forRoot({ isGlobal: true, validationSchema: envValidationSchema }),
    MongooseModule.forRootAsync({
      inject: [ConfigService],
      useFactory: async (config: ConfigService) => ({
        uri: config.get<string>('MONGODB_URI'),
        dbName: undefined, // optional if included in URI
        autoIndex: true
      })
    }),
    UsersModule,
    AuthModule
  ],
  controllers: [AppController]
})
export class AppModule {}
