import { CanActivate, ExecutionContext, Injectable, UnauthorizedException } from "@nestjs/common";
import { FastifyRequest } from "fastify";
import { verify } from "jsonwebtoken";
import { StoredUser, WithId } from "../types";
import { COOKIE } from "../utils";
import users from "../models/User";

@Injectable()
export class AuthenticatedGuard implements CanActivate {
  async canActivate(context: ExecutionContext) {
    const request = context.switchToHttp().getRequest() as FastifyRequest;
    const token = request.cookies[COOKIE];
    if (!token) throw new UnauthorizedException();
    try {
      const { _id } = verify(token, process.env.JWT_SECRET!) as { _id: string };
      const user = (await users.findOne({ _id }))?.toObject() as WithId<StoredUser> | undefined;
      if (!user) throw new UnauthorizedException();
      request.user = user;
      return true;
    } catch (e) {
      throw new UnauthorizedException();
    }
  }
}
