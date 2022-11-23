import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { RequestData } from "src/types";

import { validateAllParams } from "src/utils";

import { RequestService } from "./request.service";

import mongoose from "mongoose";

@Controller("/api/requests")
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  async createReq(@Body() info: RequestData, @Req() req, @Res() res: Response) {
    const { spotifyId, youtubeId, playRange } = info;

    if (!validateAllParams([spotifyId, youtubeId, playRange])) return res.sendStatus(400);
    // TODO: Verify authenticity of requested video, spotify track, and playrange
    res.sendStatus(202);

    try {
      const trackId = new mongoose.Types.ObjectId();
      await this.requestService.createRequest(info, req.user, trackId);

      const scanResult = await this.requestService.scanLyrics(youtubeId, trackId);

      if (!scanResult) {
        await this.requestService.updateRequest(trackId, { status: "AUTO_REJECTED" });
      } else {
        await this.requestService.updateRequest(trackId, { status: "PENDING" });
      }
    } catch (err) {
      console.error(err);
    }
  }
}
