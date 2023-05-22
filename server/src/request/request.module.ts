import { Module } from "@nestjs/common";
import { MusicService } from "../music/music.service";
import { RequestController } from "./request.controller";
import { RequestGateway } from "./request.gateway";
import { RequestService } from "./request.service";

@Module({
  imports: [],
  controllers: [RequestController],
  providers: [RequestService, MusicService /* RequestGateway */],
})
export class RequestModule {}
