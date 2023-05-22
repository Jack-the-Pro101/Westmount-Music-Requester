import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MusicModule } from "./music/music.module";
import { AuthModule } from "./auth/auth.module";
import { RequestModule } from "./request/request.module";
import { APP_GUARD } from "@nestjs/core";
import { AdminModule } from "./admin/admin.module";
import { ServeStaticModule } from "@nestjs/serve-static";
import { ThrottlerGuard, ThrottlerModule } from "@nestjs/throttler";
import { join } from "path";

@Module({
  imports: [
    ConfigModule.forRoot(),
    ServeStaticModule.forRoot({
      rootPath: join(__dirname, "..", "..", "client/dist"),
    }),
    ThrottlerModule.forRoot(),
    MusicModule,
    AuthModule,
    RequestModule,
    AdminModule,
  ],
  controllers: [],
  providers: [
    {
      provide: APP_GUARD,
      useClass: ThrottlerGuard,
    },
  ],
})
export class AppModule {}
