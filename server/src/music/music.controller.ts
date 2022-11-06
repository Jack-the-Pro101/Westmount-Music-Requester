import { Body, Controller, Get, Post } from "@nestjs/common";
import { MusicService } from "./music.service";

@Controller("/api/music")
export class MusicController {
    constructor(private readonly musicService: MusicService) {}

    @Post("/search")
    async search(@Body("query") query: string) {
        return await this.musicService.search(query);
    }

    @Get("/info")
    async getInfo(songId: string) {
        return await this.musicService.getInfo(songId);
    }
}
