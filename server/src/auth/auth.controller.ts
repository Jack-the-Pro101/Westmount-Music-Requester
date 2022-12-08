import { GoogleOAuthGuard } from "./google-oauth.guard";
import { Controller, Delete, Get, Post, Request, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { LocalAuthGuard } from "./local-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth(@Request() req) {}

  @Delete("logout")
  @UseGuards(AuthenticatedGuard)
  logout(@Request() req) {
    req.logout(function (err) {
      if (err) {
        console.log(err);

        return false;
      }
      return true;
    });
  }

  @Get("session")
  @UseGuards(AuthenticatedGuard)
  getSession(@Request() req) {
    const isGoogleUser = req.user.type === "GOOGLE";

    return {
      id: req.user.id,
      email: isGoogleUser ? req.user.email : null,
      name: req.user.name,
      avatar: isGoogleUser ? req.user.avatar : null,
      type: req.user.type,
      permissions: req.user.permissions,
    };
  }

  @UseGuards(LocalAuthGuard)
  @Post("login")
  login(@Request() req) {
    return {
      id: req.user.id,
      email: null,
      name: req.user.name,
      avatar: null,
      type: req.user.type,
      permissions: req.user.permissions,
    };
  }

  @Get("google-redirect")
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Request() req, @Res() res) {
    const user = this.authService.googleLogin(req);

    if (user) {
      if (process.env.NODE_ENV !== "production") {
        res.redirect("http://localhost:5173");
      } else {
        res.redirect("/");
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        res.redirect("http://localhost:5173/error?code=auth");
      } else {
        res.redirect("/error?code=auth");
      }
    }
  }
}
