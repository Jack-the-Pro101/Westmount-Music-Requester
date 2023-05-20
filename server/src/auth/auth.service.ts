import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { StoredUser, WithId } from "../types";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { FastifyReply, FastifyRequest } from "fastify";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";
import { verify } from "jsonwebtoken";
import { getAccessToken, getUserProfile } from "src/utils";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async googleLogin(req: FastifyRequest): Promise<StoredUser | undefined> {
    const code = Object.getOwnPropertyDescriptor(req.query, "code")?.value;
    const stateToken = Object.getOwnPropertyDescriptor(req.query, "state")?.value;
    if (!code || !stateToken || typeof code !== "string" || typeof stateToken !== "string") throw new BadRequestException();
    try {
      const result = verify(stateToken, process.env.JWT_SECRET!) as { expires: number; };
      if (Date.now() > result.expires) throw new BadRequestException();
    } catch {
      throw new BadRequestException();
    }
    const token = await getAccessToken(process.env.GOOGLE_CLIENT_ID!, process.env.GOOGLE_CLIENT_SECRET!, code, "http://localhost:3000/api/auth/google-redirect");
    console.log(code, stateToken);
    if (!token) throw new UnauthorizedException();
    const rawUser = await getUserProfile(token);
    console.log(rawUser)
    if (!rawUser) return;

    const user: StoredUser = {
      type: "GOOGLE",
      email: rawUser.email,
      avatar: rawUser.picture,
      name: rawUser.name,
      permissions: 2,
    };
    // if (!user.email.endsWith("@hwdsb.on.ca")) throw new DomainEmailInvalidException();

    const storedUser = await this.usersService.createOrUpdateOne(user);
    return storedUser as StoredUser;
  }

  async validateUser(username: string, password: string): Promise<WithId<StoredUser> | undefined> {
    const user = await this.usersService.findOne(username, true);

    if (!user || user.type !== "INTERNAL") return;
    if (!(await bcrypt.compare(password, user.password!))) return;
    return user;
  }
}
