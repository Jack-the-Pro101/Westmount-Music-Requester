import { BadRequestException, Body, Controller, ForbiddenException, Get, Param, Patch, Post, Query, Req, Res, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { UsersService } from "src/users/users.service";

import { StoredUser } from "src/types";
import { validateAllParams } from "src/utils";

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
  async getUsers(@Req() req: Request, @Query("page") page: number, @Param("limit") limit: number) {
    return await this.usersService.getUsers(limit, page || 0);
  }

  @Post("users")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async createUser(@Body() data: Partial<StoredUser>, @Res() res: Response) {
    if (!data.type) throw new BadRequestException();
    if (data.type === "INTERNAL") {
      if (!validateAllParams([data.username, data.permissions, data.password])) throw new BadRequestException();
      data.password = await bcrypt.hash(data.password!, 10);
    } else {
      if (!validateAllParams([data.email, data.permissions, data.avatar])) throw new BadRequestException();
    }

    for (const key in data) {
      if (Object.prototype.hasOwnProperty.call(data, key)) {
        if (data[key] == null) delete data[key];
      }
    }

    return await this.usersService.create(data);
  }

  @Patch("users/:userId")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async updateUser(@Param("userId") userId: string, @Body() data: Partial<StoredUser>, @Res() res: Response) {
    if (!validateAllParams([userId, data])) throw new BadRequestException();
    if (data.type === "INTERNAL" && data.username == process.env.SYS_ADMIN_USERNAME) throw new ForbiddenException;
    return await this.usersService.updateUser({ _id: userId }, data);
  }
}
