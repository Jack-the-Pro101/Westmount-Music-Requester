import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";
import { StoredUser } from "src/types";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as FastifyRequest;
    const token = request.cookies["WMR_SID"];
    if (!token) throw new UnauthorizedException();
    try {
      const user = verify(token, process.env.JWT_SECRET!) as StoredUser;
      request.user = user;
      return true;
    } catch {
      throw new UnauthorizedException();
    }
  }
}