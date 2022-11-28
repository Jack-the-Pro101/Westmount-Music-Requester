import { Injectable, CanActivate, ExecutionContext } from "@nestjs/common";
import { ROLES_KEY } from "./roles.decorator";
import { Reflector } from "@nestjs/core";

import { check } from "src/permissions/manager";

@Injectable()
export class RolesGuard implements CanActivate {
  constructor(private reflector: Reflector) {}

  canActivate(context: ExecutionContext): boolean {
    const requiredRoles = this.reflector.getAllAndOverride<string[]>(ROLES_KEY, [context.getHandler(), context.getClass()]);

    const { user } = context.switchToHttp().getRequest();

    if (!user.permissions) return true; // TODO: CHANGE THIS

    return check(requiredRoles, user.permissions);
  }
}
