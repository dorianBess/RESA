import { UnauthorizedException } from '@nestjs/common';
import { JwtAuthGuard } from '../../../../shared/guards/jwt-auth.guard';

describe('JwtAuthGuard', () => {
  let guard: JwtAuthGuard;

  beforeEach(() => {
    guard = new JwtAuthGuard();
  });

  // TEST-AUTH-04 — Token expiré
  it('TEST-AUTH-04: lève UnauthorizedException "Token expiré" quand token expiré', () => {
    const expiredInfo = { name: 'TokenExpiredError', message: 'jwt expired' };

    expect(() => guard.handleRequest(null, null, expiredInfo)).toThrow(
      new UnauthorizedException('Token expiré'),
    );
  });

  it('retourne le user quand token valide', () => {
    const user = { tenantId: 'tenant-id', email: 'test@test.com' };
    const result = guard.handleRequest(null, user, null);
    expect(result).toBe(user);
  });

  it('lève UnauthorizedException par défaut si pas de user', () => {
    expect(() => guard.handleRequest(null, null, null)).toThrow(
      UnauthorizedException,
    );
  });
});
