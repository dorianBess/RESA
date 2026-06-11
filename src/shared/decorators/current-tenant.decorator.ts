import { createParamDecorator, ExecutionContext } from '@nestjs/common';

export interface TenantPayload {
  sub: string;
  tenantId: string;
  email: string;
  role?: string;
}

export const CurrentTenant = createParamDecorator(
  (_data: unknown, ctx: ExecutionContext): TenantPayload => {
    const request = ctx.switchToHttp().getRequest();
    return request.user;
  },
);
