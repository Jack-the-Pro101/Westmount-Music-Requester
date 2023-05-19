import { Body, Controller, Get, Header, Post, Query, Res, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import { MusicService } from "./music.service";

import { Response } from "express";

@Controller("/api/music")
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Throttle(3, 10)
  @Post("/search")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async search(@Body("query") query: string) {
    return await this.musicService.searchSpotify(query);
  }

  @Throttle(6, 10)
  @Get("/source")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getSource(@Query("id") id: string, @Res() res: Response) {
    const source = await this.musicService.getYtSource(id);

    if (!source) return res.sendStatus(500);

    return res.json(source);
  }

  @Throttle(4, 5)
  @Get("/info")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  @Header("Content-Type", "application/json")
  async getInfo(@Query("song") query: string) {
    return await this.musicService.searchYt(query);
  }
}
