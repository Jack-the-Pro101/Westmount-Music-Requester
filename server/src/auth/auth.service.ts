import { Injectable } from "@nestjs/common";
import { GoogleUser, StoredUser } from "src/types";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { FastifyRequest } from "fastify";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async googleLogin(req: FastifyRequest): Promise<GoogleUser | undefined> {
    const user = req.session.grant.response?.profile;
    console.log(user);
    if (!user) return;

    if (!user.email.endsWith("@hwdsb.on.ca")) throw new DomainEmailInvalidException();

    const storedUser = await this.usersService.getOrCreateOne(user.email, false, {
      email: user.email,
      avatar: user.picture,
      name: `${user.firstName} ${user.lastName}`,
    });
    return storedUser as unknown as GoogleUser;
  }

  async validateUser(username: string, password: string): Promise<StoredUser | undefined> {
    const user = await this.usersService.findOne(username, true);

    if (!user || user.type !== "INTERNAL") return;
    if (!(await bcrypt.compare(password, user.password!))) return;
    return user as StoredUser;
  }
}
