import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { UserRole } from '@generated/prisma';
import { IS_PUBLIC_KEY, ROLES_KEY } from '@shared/decorators';

@Injectable()
export class RoleGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const isPublic = this.reflector.getAllAndOverride<boolean>(IS_PUBLIC_KEY, [
      context.getHandler(),
      context.getClass(),
    ]);

    if (isPublic) {
      return true;
    }

    const requiredRoles = this.reflector.getAllAndOverride<UserRole[]>(
      ROLES_KEY,
      [context.getHandler(), context.getClass()],
    );

    // Deny-by-default: a non-public route without an explicit @Roles() is forbidden.
    if (!requiredRoles || requiredRoles.length === 0) {
      return false;
    }

    const { role } = context.switchToHttp().getRequest().user;
    return requiredRoles.includes(role);
  }
}
