import { Injectable } from "@nestjs/common";
import { GoogleUser } from "src/types";

@Injectable()
export class AuthService {
  googleLogin(req): GoogleUser | false {
    if (!req.user) {
      return false;
    }

    return {
      user: req.user,
    };
  }
}
