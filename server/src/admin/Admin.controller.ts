import { Controller, Get, Param, Req, Res, UseGuards } from "@nestjs/common";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { UsersService } from "src/users/users.service";

@Controller("/api/admin")
export class AdminController {
  constructor(private readonly usersService: UsersService) {}

  @Get("users/:limit")
  @Roles("MANAGE_USERS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getUsers(@Req() req: Request, @Param("limit") limit: number) {
    return await this.usersService.getUsers(limit);
  }
}
