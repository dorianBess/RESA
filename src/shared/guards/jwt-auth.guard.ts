import { Injectable, UnauthorizedException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtAuthGuard extends AuthGuard('jwt') {
  handleRequest<TUser = any>(err: any, user: TUser, info: any): TUser {
    if (info?.name === 'TokenExpiredError') {
      throw new UnauthorizedException('Token expiré');
    }
    if (err || !user) {
      throw err || new UnauthorizedException();
    }
    return user;
  }
}
