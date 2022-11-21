import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MusicModule } from "./music/music.module";
import { AuthModule } from "./auth/auth.module";
import { RequestModule } from "./request/request.module";

@Module({
  imports: [ConfigModule.forRoot(), MusicModule, AuthModule, RequestModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
