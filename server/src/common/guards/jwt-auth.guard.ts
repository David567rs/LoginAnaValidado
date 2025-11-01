import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from '@nestjs/common'
import { JwtService } from '@nestjs/jwt'

@Injectable()
export class JwtAuthGuard implements CanActivate {
  constructor(private readonly jwt: JwtService) {}

  async canActivate(context: ExecutionContext) {
    const req = context.switchToHttp().getRequest()
    const header = req.headers['authorization'] as string | undefined
    if (!header || !header.startsWith('Bearer ')) throw new UnauthorizedException()
    const token = header.substring('Bearer '.length)
    try {
      const payload = await this.jwt.verifyAsync(token)
      req.user = payload
      return true
    } catch {
      throw new UnauthorizedException()
    }
  }
}

