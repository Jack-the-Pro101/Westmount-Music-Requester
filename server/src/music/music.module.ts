import { Module } from "@nestjs/common";
import { RolesGuard } from "src/auth/roles.guard";
import { MusicController } from "./music.controller";
import { MusicService } from "./music.service";

@Module({
  imports: [],
  controllers: [MusicController],
  providers: [MusicService],
})
export class MusicModule {}
