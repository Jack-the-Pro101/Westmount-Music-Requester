import { Body, Controller, Delete, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestData } from "src/types";

import { validateAllParams } from "src/utils";

import { RequestService } from "./request.service";

import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import mongoose from "mongoose";
import { StoredAuthenticatedRequest } from "src/server";
import { Throttle } from "@nestjs/throttler";

@Controller("/api/requests")
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Throttle(2, 1)
  @Get()
  @Roles("ACCEPT_REQUESTS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getRequests() {
    return await this.requestService.getRequests();
  }

  @Throttle(1, 4)
  @Post()
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async createReq(@Body() info: RequestData, @Req() req: StoredAuthenticatedRequest, @Res() res: Response) {
    const { spotifyId, youtubeId, playRange } = info;

    if (!validateAllParams([spotifyId, youtubeId, playRange])) return res.sendStatus(400);

    try {
      if (!(await this.requestService.validateRequest(info, req.user))) return res.sendStatus(400);

      const trackId = await this.requestService.getTrackId(youtubeId);

      if (await this.requestService.checkExistingRequest(spotifyId, trackId, req.user._id)) return res.sendStatus(400);

      res.sendStatus(202);

      if (!(await this.requestService.createRequest(info, req.user, trackId))) return;
      const scanResult = await this.requestService.scanLyrics(youtubeId, trackId);

      if (scanResult === false) {
        await this.requestService.updateRequest({ track: trackId, status: "PRE_PENDING" }, { status: "AUTO_REJECTED" });
      } else {
        await this.requestService.updateRequest({ track: trackId, status: "PRE_PENDING" }, { status: scanResult == null ? "PENDING_MANUAL" : "PENDING" });
      }
    } catch (err) {
      console.error(err);
    }
  }

  @Throttle(3, 20)
  @Patch(":trackId")
  @Roles("ACCEPT_REQUESTS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async acceptRequest(@Param("trackId") trackId: string, @Body() info: { evaluation: boolean }, @Res() res: Response) {
    const { evaluation } = info;
    if (!validateAllParams([evaluation])) return res.sendStatus(400);

    if (!mongoose.Types.ObjectId.isValid(trackId) || new mongoose.Types.ObjectId(trackId).toString() !== trackId) return res.sendStatus(400);

    if (!evaluation) {
      await this.requestService.updateManyRequests({ track: trackId }, { status: "REJECTED" });
      return res.sendStatus(200);
    }

    this.requestService.finalizeRequest(trackId);

    res.sendStatus(200);
  }

  @Throttle(1, 30)
  @Delete()
  @Roles("ADMINISTRATOR")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async recycleRequests() {
    return await this.requestService.recycleRequests();
  }

  @Throttle(3, 3)
  @Get("/me")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getPersonalRequests(@Req() req: StoredAuthenticatedRequest) {
    return await this.requestService.getPersonalRequests(req.user._id.toString());
  }
}
