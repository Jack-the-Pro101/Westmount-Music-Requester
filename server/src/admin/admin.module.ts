import { Module } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { AdminController } from "./admin.controller";

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [UsersService],
})
export class AdminModule {}
