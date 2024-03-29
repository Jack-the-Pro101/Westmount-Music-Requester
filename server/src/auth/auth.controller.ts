import { ConflictException, Controller, Delete, Get, Post, Req, Res, UnauthorizedException, UseGuards } from "@nestjs/common";
import { AuthService } from "./auth.service";

import { AuthenticatedGuard } from "./authenticated.guard";
import { Throttle } from "@nestjs/throttler";
import { FastifyReply, FastifyRequest } from "fastify";
import { sign } from "jsonwebtoken";
import { StoredUser, WithId } from "../types";
import { COOKIE } from "../utils";

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
    res.redirect(302, this.authService.getCurrentOauthUrl());
  }

  @Throttle(2, 5)
  @Delete("logout")
  @UseGuards(AuthenticatedGuard)
  logout(@Res() res: FastifyReply) {
    // TODO: token whitelist & expiry
    res.clearCookie(COOKIE);
    res.send();
  }

  @Throttle(15, 5)
  @Get("session")
  @UseGuards(AuthenticatedGuard)
  getSession(@Req() req: FastifyRequest) {
    const user = Object.assign({}, req.user) as StoredUser & {
      password?: string;
    };
    delete user.password;
    return user;
  }

  @Throttle(4, 6)
  @Post("login")
  async login(@Req() request: FastifyRequest, @Res() response: FastifyReply) {
    // const token = request.cookies[COOKIE];
    // if (token) throw new ConflictException();
    const { username, password } = request.body as FastifyUser;
    const storedUser = await this.authService.validateUser(username, password);
    if (!storedUser) throw new UnauthorizedException();
    let user = Object.assign({}, storedUser) as WithId<StoredUser> & {
      password?: string;
    };
    delete user.password;
    const token = sign({ _id: user._id }, process.env.JWT_SECRET!);
    response.setCookie(COOKIE, token, { path: "/" });
    response.send(user);
  }

  @Throttle(4, 6)
  @Get("google-redirect")
  async googleAuthRedirect(@Req() req: FastifyRequest, @Res({ passthrough: true }) res: FastifyReply) {
    const user = await this.authService.googleLogin(req);
    if (user) {
      const token = sign({ _id: user._id }, process.env.JWT_SECRET!);
      res.setCookie(COOKIE, token, { path: "/" });
      if (process.env.NODE_ENV !== "production") {
        res.status(302).redirect("http://localhost:5173");
      } else {
        res.status(302).redirect("/");
      }
    } else {
      if (process.env.NODE_ENV !== "production") {
        res.status(302).redirect("http://localhost:5173/error?code=auth");
      } else {
        res.status(302).redirect("/error?code=auth");
      }
    }
  }
}
