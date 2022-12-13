import { Injectable } from "@nestjs/common";
import { GoogleUser, StoredUser } from "src/types";
import { UsersService } from "./users.service";
import * as bcrypt from "bcrypt";
import { GoogleAuthenticatedRequest } from "src/server";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  googleLogin(req: GoogleAuthenticatedRequest): GoogleUser | undefined {
    if (!req.user) return;

    return req.user;
  }

  async validateUser(username: string, password: string): Promise<StoredUser | undefined> {
    const user = await this.usersService.findOne(username, true);

    if (!user || user.type !== "INTERNAL") return;
    if (!(await bcrypt.compare(password, user.password!))) return;
    return user as StoredUser;
  }
}
