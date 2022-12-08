import { Module } from "@nestjs/common";
import { RequestController } from "./request.controller";
import { RequestGateway } from "./request.gateway";
import { RequestService } from "./request.service";

@Module({
  imports: [],
  controllers: [RequestController],
  providers: [RequestService, RequestGateway],
})
export class RequestModule {}
