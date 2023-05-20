import {
  BadRequestException,
  Body,
  Controller,
  ForbiddenException,
  Get,
  Param,
  Patch,
  Post,
  Query,
  UseGuards,
} from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { UsersService } from "src/users/users.service";

import { StoredUser } from "../types";
import { validateAllParams } from "src/utils";

import * as bcrypt from "bcrypt";

type CreateUser = {
  type: "INTERNAL";
  username: string;
  password: string;
  permissions: number;
  name?: string;
};

@Controller("/api/admin")
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users/search")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async searchUsers(
    @Query("page") page: number,
    @Query("limit") limit: number,
    @Query("query") query: string
  ) {
    if (query == null) query = "";
    return await this.usersService.searchUsers(
      {
        $or: [
          { username: { $regex: query, $options: "i" } },
          { email: { $regex: query, $options: "i" } },
        ],
      },
      limit || 100,
      page || 0
    );
  }

  @Get("users/:limit")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getUsers(@Query("page") page: number, @Param("limit") limit: number) {
    return await this.usersService.getUsers(limit, page || 0);
  }

  @Post("users")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async createUser(@Body() data: CreateUser) {
    if (!validateAllParams([data.username, data.permissions, data.password]))
      throw new BadRequestException();
    const hash = await bcrypt.hash(data.password, 10);
    return await this.usersService.create({
      username: data.username,
      password: hash,
      permissions: data.permissions,
    });
  }

  @Patch("users/:userId")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async updateUser(
    @Param("userId") userId: string,
    @Body() data: Partial<StoredUser>
  ) {
    if (!validateAllParams([userId, data])) throw new BadRequestException();
    if (
      data.type === "INTERNAL" &&
      data.username == process.env.SYS_ADMIN_USERNAME
    )
      throw new ForbiddenException();
    return await this.usersService.updateUser({ _id: userId }, data);
  }
}
