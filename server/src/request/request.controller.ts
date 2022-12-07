import { Body, Controller, Get, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Response } from "express";
import { RequestData } from "src/types";

import { validateAllParams } from "src/utils";

import { RequestService } from "./request.service";

import mongoose from "mongoose";
import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";

@Controller("/api/requests")
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Get()
  @Roles("ACCEPT_REQUESTS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getRequests() {
    return await this.requestService.getRequests();
  }

  @Post()
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async createReq(@Body() info: RequestData, @Req() req, @Res() res: Response) {
    const { spotifyId, youtubeId, playRange } = info;

    if (!validateAllParams([spotifyId, youtubeId, playRange])) return res.sendStatus(400);
    // TODO: Verify authenticity of requested video, spotify track, and playrange
    res.sendStatus(202);

    try {
      const trackId = new mongoose.Types.ObjectId();
      if (!(await this.requestService.createRequest(info, req.user, trackId))) return;

      const scanResult = await this.requestService.scanLyrics(youtubeId, trackId);

      if (scanResult == false) {
        await this.requestService.updateRequest(trackId, { status: "AUTO_REJECTED" });
      } else {
        await this.requestService.updateRequest(trackId, { status: scanResult == null ? "PENDING_MANUAL" : "PENDING" });
      }
    } catch (err) {
      console.error(err);
    }
  }
}
