import { GoogleOAuthGuard } from "./google-oauth.guard";
import { Controller, Delete, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { LocalAuthGuard } from "./local-auth.guard";
import { AuthenticatedGuard } from "./authenticated.guard";
import { Request, Response } from "express";
import { GoogleAuthenticatedRequest, StoredAuthenticatedRequest } from "src/server";
import { Throttle } from "@nestjs/throttler";

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle(4, 6)
  @Get()
  @UseGuards(GoogleOAuthGuard)
  async googleAuth() {}

  @Throttle(2, 5)
  @Delete("logout")
  @UseGuards(AuthenticatedGuard)
  logout(@Req() req: Request) {
    req.logout(function (err) {
      if (err) {
        console.log(err);

        return false;
      }
      return true;
    });
  }

  @Throttle(15, 5)
  @Get("session")
  @UseGuards(AuthenticatedGuard)
  getSession(@Req() req: StoredAuthenticatedRequest) {
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

  @Throttle(4, 6)
  @Post("login")
  @UseGuards(LocalAuthGuard)
  login(@Req() req: StoredAuthenticatedRequest) {
    return {
      id: req.user.id,
      email: null,
      name: req.user.name,
      avatar: null,
      type: req.user.type,
      permissions: req.user.permissions,
    };
  }

  @Throttle(4, 6)
  @Get("google-redirect")
  @UseGuards(GoogleOAuthGuard)
  googleAuthRedirect(@Req() req: GoogleAuthenticatedRequest, @Res() res: Response) {
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
