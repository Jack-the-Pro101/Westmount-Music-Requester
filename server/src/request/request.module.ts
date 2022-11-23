import { MiddlewareConsumer, Module } from "@nestjs/common";
import { RequestController } from "./request.controller";
import { RequestService } from "./request.service";

import { AuthMiddleware } from "src/middleware/auth";

@Module({
  imports: [],
  controllers: [RequestController],
  providers: [RequestService],
})
export class RequestModule {
  configure(consumer: MiddlewareConsumer) {
    consumer.apply(AuthMiddleware).forRoutes("/api/*");
  }
}
