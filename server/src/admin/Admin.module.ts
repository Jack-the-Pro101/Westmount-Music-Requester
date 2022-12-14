import { Module } from "@nestjs/common";
import { UsersService } from "src/users/users.service";
import { AdminController } from "./Admin.controller";

@Module({
  imports: [],
  controllers: [AdminController],
  providers: [UsersService],
})
export class AdminModule {}
