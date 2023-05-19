import { Body, Controller, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { UsersService } from "src/users/users.service";

import { StoredUser } from "src/types";
import { validateAllParams } from "src/utils";
import { Response } from "express";

import * as bcrypt from "bcrypt";

@Controller("/api/admin")
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users/search")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async searchUsers(@Req() req: Request, @Query("page") page: number, @Query("limit") limit: number, @Query("query") query: string) {
    if (query == null) query = "";
    return await this.usersService.searchUsers(
      { $or: [{ username: { $regex: query, $options: "i" } }, { email: { $regex: query, $options: "i" } }] },
      limit || 100,
      page || 0
    );
  }

  @Get("users/:limit")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getUsers(@Res() res: Response, @Query("page") page: number, @Param("limit") limit: number) {
    if (limit > 200) return res.sendStatus(400);
    return res.json(await this.usersService.getUsers(limit, page || 0));
  }

  @Post("users")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async createUser(@Body() data: Partial<StoredUser>, @Res() res: Response) {
    if (!data.type) return res.sendStatus(400);
    if (data.type === "INTERNAL") {
      if (!validateAllParams([data.username, data.permissions, data.password])) return res.sendStatus(400);

      // @ts-expect-error
      data.password = await bcrypt.hash(data.password, 10);
    } else {
      if (!validateAllParams([data.email, data.permissions, data.avatar])) return res.sendStatus(400);
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key] == null) delete data[key];
      }
    }

    return res.json(await this.usersService.create(data));
  }

  @Patch("users/:userId")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async updateUser(@Param("userId") userId: string, @Body() data: Partial<StoredUser>, @Res() res: Response) {
    if (!validateAllParams([userId, data])) return res.sendStatus(400);

    if (data.type === "INTERNAL" && data.username == process.env.SYS_ADMIN_USERNAME) return res.sendStatus(403);

    return res.json(await this.usersService.updateUser({ _id: userId }, data));
  }
}
