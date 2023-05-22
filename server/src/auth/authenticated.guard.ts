import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";
import { StoredUser, WithId } from "../types";
import { COOKIE } from "src/utils";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as FastifyRequest;
    const token = request.cookies[COOKIE];
    if (!token) throw new UnauthorizedException();
    try {
      const user = verify(token, process.env.JWT_SECRET!) as WithId<StoredUser>;
      request.user = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
