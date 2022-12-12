import { Body, Controller, Get, Header, Post, Query } from "@nestjs/common";
import { MusicService } from "./music.service";

@Controller("/api/music")
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Post("/search")
  async search(@Body("query") query: string) {
    return await this.musicService.searchSpotify(query);
  }

  @Get("/source")
  async getSource(@Query("id") id: string) {
    const source = await this.musicService.getYtSource(id);

    return source;
  }

  @Get("/info")
  @Header("Content-Type", "application/json")
  async getInfo(@Query("song") query: string) {
    return await this.musicService.searchYt(query);
  }
}
