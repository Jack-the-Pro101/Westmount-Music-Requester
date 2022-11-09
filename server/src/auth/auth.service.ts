import { Injectable } from "@nestjs/common";

@Injectable()
export class AuthService {
  googleLogin(req) {
    if (!req.user) {
      return false;
    }

    return {
      user: req.user,
    };
  }
}
