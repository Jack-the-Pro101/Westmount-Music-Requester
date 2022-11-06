import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { MusicModule } from "./music/music.module";

@Module({
    imports: [ConfigModule.forRoot(), MusicModule],
    controllers: [],
    providers: [],
})
export class AppModule {}
