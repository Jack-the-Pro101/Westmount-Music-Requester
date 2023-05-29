import { Controller, Get, Header, InternalServerErrorException, Query, Req, UseGuards } from "@nestjs/common";
import { Throttle } from "@nestjs/throttler";
import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import { MusicService } from "./music.service";
import { FastifyRequest } from "fastify";

@Controller("/api/music")
export class MusicController {
  constructor(private readonly musicService: MusicService) {}

  @Throttle(3, 10)
  @Get("/search")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async search(@Query("query") query: string) {
    return await this.musicService.searchSpotify(query);
  }

  @Throttle(6, 10)
  @Get("/source")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getSource(@Query("id") id: string, @Req() req: FastifyRequest) {
    const excludeWeba = /^((?!chrome|android).)*safari/i.test(req.headers["user-agent"] || "");

    const excludedFormats = [];
    if (excludeWeba) excludedFormats.push("webm");

    const source = await this.musicService.getYtSource(id, excludedFormats);

    if (!source) throw new InternalServerErrorException();

    return source;
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
