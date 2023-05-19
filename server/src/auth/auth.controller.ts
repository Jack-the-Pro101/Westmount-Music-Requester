import { ConflictException, Controller, Delete, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { AuthenticatedGuard } from "./authenticated.guard";
import { Throttle } from "@nestjs/throttler";
import { FastifyReply, FastifyRequest } from "fastify";
import { sign } from "jsonwebtoken";
import { getCurrentOauthUrl } from "src/utils";

interface FastifyUser {
  username: string;
  password: string;
}

@Controller("/api/auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Throttle(4, 6)
  @Get()
  googleAuth(@Res() res: FastifyReply) {
    res.redirect(302, getCurrentOauthUrl());
  }

  @Throttle(2, 5)
  @Delete("logout")
  @UseGuards(AuthenticatedGuard)
  logout(@Res() res: FastifyReply) {
    res.clearCookie("WMR_SID");
    res.send();
  }

  @Throttle(15, 5)
  @Get("session")
  @UseGuards(AuthenticatedGuard)
  getSession(@Req() req: FastifyRequest) {
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
  async login(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    // const token = request.cookies["WMR_SID"];
    // if (token) throw new ConflictException();
    const { username, password } = request.body as FastifyUser;
    const user = await this.authService.validateUser(username, password);
  
    if (!user) throw new UnauthorizedException();
    const token = sign({
      type: "LOCAL",
      _id: user._id,
      email: null,
      name: user.name,
      avatar: null,
      permissions: user.permissions,
    }, process.env.JWT_SECRET!);
    response.setCookie("WMR_SID", token, { path: "/" });
    response.send({
      id: user.id,
      email: null,
      name: user.name,
      avatar: null,
      type: user.type,
      permissions: user.permissions,
    });
  }

  @Throttle(4, 6)
  @Get("google-redirect")
  async googleAuthRedirect(@Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const user = await this.authService.googleLogin(req, res);

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
