import { Injectable } from "@nestjs/common";
import { GoogleUser, StoredUser } from "src/types";
import { UsersService } from "./users.service";
import * as bcrypt from "bcrypt";

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  googleLogin(req): GoogleUser | false {
    if (!req.user) {
      return false;
    }

    return req.user;
  }

  async validateUser(username: string, password: string): Promise<StoredUser | null | false> {
    const user = await this.usersService.findOne(username, true);

    if (!user) return null;
    if (!(await bcrypt.compare(password, user.password))) return false;
    return user;
  }
}
