import { GoogleOAuthGuard } from "./google-oauth.guard";
import { Controller, Delete, Get, Post, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { GoogleUser } from "src/types";
import { LocalAuthGuard } from "./local-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Delete()
  @UseGuards(AuthenticatedGuard)
  logout(@Request() req) {}

  @Get("session")
  getSession(@Request() req) {
    console.log(req.user);
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Request() req) {}

  @Get("google-redirect")
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res) {
    const user: GoogleUser | false = this.authService.googleLogin(req);

    if (user) {
      if (process.env.NODE_ENV !== "production") {
        res.redirect("http://localhost:5173");
      } else {
        res.redirect("/");
      }
    } else {
      res.redirect("/error?code=auth");
    }
  }
}
