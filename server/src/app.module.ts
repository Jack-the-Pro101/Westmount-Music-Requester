import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MusicModule } from "./music/music.module";
import { AuthModule } from "./auth/auth.module";

@Module({
  imports: [ConfigModule.forRoot(), MusicModule, AuthModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
