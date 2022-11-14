import { GoogleOAuthGuard } from "./google-oauth.guard";
import { Controller, Delete, Get, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { sign, verify } from "jsonwebtoken";

import { GoogleUser } from "src/types";

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Delete()
  @UseGuards(GoogleOAuthGuard)
  logout(@Request() req) {}

  @Get("session")
  getSession(@Request() req) {
    const jwtToken = req.cookies["auth_token"];

    if (!jwtToken) return false;

    try {
      return verify(jwtToken, process.env.JWT_SECRET);
    } catch (err) {
      return false;
    }
  }

  @Get("google-redirect")
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res) {
    const user: GoogleUser | false = this.authService.googleLogin(req);

    if (user) {
      try {
        const jwt = sign(user, process.env.JWT_SECRET);

        res.cookie("auth_token", jwt);
        if (process.env.NODE_ENV !== "production") {
          res.redirect("http://localhost:5173");
        } else {
          res.redirect("/");
        }
      } catch (err) {
        res.redirect("/api/auth/error?code=JWT");
      }
    } else {
      res.redirect("/api/auth/error?code=");
    }
  }
}
