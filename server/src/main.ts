import 'reflect-metadata'
import { NestFactory } from '@nestjs/core'
import { AppModule } from './app.module.js'
import helmet from 'helmet'
import { ValidationPipe } from '@nestjs/common'

async function bootstrap() {
  const app = await NestFactory.create(AppModule)

  app.use(helmet())
  app.enableCors({ origin: true, credentials: true })
  app.setGlobalPrefix('api')
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }))

  const port = process.env.PORT ? Number(process.env.PORT) : 4000
  await app.listen(port)
  // eslint-disable-next-line no-console
  console.log(`API listening on http://localhost:${port}`)
}

bootstrap()
