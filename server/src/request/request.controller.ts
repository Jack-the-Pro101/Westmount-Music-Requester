import { Body, Controller, Get, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";
import { Request, Response } from "express";
import { RequestData } from "src/types";

import { validateAllParams } from "src/utils";

import { RequestService } from "./request.service";

import { AuthenticatedGuard } from "src/auth/authenticated.guard";
import { Roles } from "src/auth/roles.decorator";
import { RolesGuard } from "src/auth/roles.guard";
import mongoose from "mongoose";
import { StoredAuthenticatedRequest } from "src/server";

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
  async createReq(@Body() info: RequestData, @Req() req: Request, @Res() res: Response) {
    const { spotifyId, youtubeId, playRange } = info;

    if (!validateAllParams([spotifyId, youtubeId, playRange])) return res.sendStatus(400);

    try {
      if (!(await this.requestService.validateRequest(info))) return res.sendStatus(400);
      res.sendStatus(202);

      const trackId = await this.requestService.getTrackId(youtubeId);

      if (!(await this.requestService.createRequest(info, req.user, trackId))) return;
      const scanResult = await this.requestService.scanLyrics(youtubeId, trackId);

      if (scanResult === false) {
        await this.requestService.updateRequest({ track: trackId }, { status: "AUTO_REJECTED" });
      } else {
        await this.requestService.updateRequest({ track: trackId }, { status: scanResult == null ? "PENDING_MANUAL" : "PENDING" });
      }
    } catch (err) {
      console.error(err);
    }
  }

  @Patch(":requestId")
  @Roles("ACCEPT_REQUESTS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async acceptRequest(@Param("requestId") requestId: string, @Body() info: { evaluation: boolean; }, @Res() res: Response) {
    if (!mongoose.Types.ObjectId.isValid(requestId) || new mongoose.Types.ObjectId(requestId).toString() !== requestId) return res.sendStatus(400);

    const { evaluation } = info;
    if (!validateAllParams([evaluation])) return res.sendStatus(400);

    if (!evaluation) {
      await this.requestService.updateRequest({ _id: requestId }, { status: "REJECTED" });
      return res.sendStatus(200);
    }

    this.requestService.finalizeRequest(requestId);

    res.sendStatus(200);
  }

  @Get("/me")
  @Roles("USE_REQUESTER")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async getPersonalRequests(@Req() req: StoredAuthenticatedRequest) {
    return await this.requestService.getPersonalRequests(req.user._id.toString());
  }
}
