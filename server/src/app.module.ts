import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MusicModule } from "./music/music.module";
import { AuthModule } from "./auth/auth.module";
import { RequestModule } from "./request/request.module";
import { APP_GUARD } from "@nestjs/core";
import { AdminModule } from "./admin/Admin.module";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";

@Module({
  imports: [ConfigModule.forRoot(), ThrottlerModule.forRoot(), MusicModule, AuthModule, RequestModule, AdminModule],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
