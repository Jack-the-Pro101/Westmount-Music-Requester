import { BadRequestException, Body, Controller, Delete, Get, InternalServerErrorException, Param, Patch, Post, Req, Res, UseGuards } from "@nestjs/common";

import { RequestData } from "../types";

import { validateAllParams } from "../utils";

import { RequestService } from "./request.service";

import { AuthenticatedGuard } from "../auth/authenticated.guard";
import { Roles } from "../auth/roles.decorator";
import { RolesGuard } from "../auth/roles.guard";
import mongoose from "mongoose";
import { Throttle } from "@nestjs/throttler";
import { FastifyReply, FastifyRequest } from "fastify";

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
  async createReq(@Body() info: RequestData, @Req() req: FastifyRequest, @Res() res: FastifyReply) {
    const { spotifyId, youtubeId, playRange } = info;

    if (!validateAllParams([spotifyId, youtubeId, playRange])) throw new BadRequestException();

    try {
      if (!(await this.requestService.validateRequest(info, req.user))) throw new BadRequestException();

      const trackId = await this.requestService.getTrackId(youtubeId);
      if (trackId == null) return;

      if (await this.requestService.checkExistingRequest(spotifyId, trackId, req.user._id)) throw new BadRequestException();

      if (!(await this.requestService.createRequest(info, req.user, trackId)))
        return console.error(`Failed to create request for ${req.user._id}, requesting song ${spotifyId} at ${youtubeId}`);
      const scanResult = await this.requestService.scanLyrics(youtubeId, trackId);

      if (scanResult === false) {
        await this.requestService.updateRequest({ track: trackId, status: "AWAITING" }, { status: "AUTO_REJECTED" });
      } else {
        await this.requestService.updateRequest({ track: trackId, status: "AWAITING" }, { status: scanResult == null ? "PENDING_MANUAL" : "PENDING" });
      }
      res.status(202).send();
    } catch (err) {
      console.error(err);
      throw new InternalServerErrorException();
    }
  }

  // Request cancelling code
  // Disabled until further notice

  // @Throttle(4, 30)
  // @Delete(":requestId")
  // @Roles("USE_REQUESTER")
  // @UseGuards(AuthenticatedGuard, RolesGuard)
  // async deleteRequest(@Param("requestId") requestId: string, @Res() res: Response) {
  //   if (!validateAllParams([requestId])) return res.sendStatus(400);

  //   return res.sendStatus(await this.requestService.cancelRequest(requestId) ? 200 : 500)
  // }

  @Throttle(3, 20)
  @Patch(":trackId")
  @Roles("ACCEPT_REQUESTS")
  @UseGuards(AuthenticatedGuard, RolesGuard)
  async acceptRequest(@Param("trackId") trackId: string, @Body() info: { evaluation: boolean }, @Res() res: FastifyReply) {
    const { evaluation } = info;
    if (!validateAllParams([evaluation])) throw new BadRequestException();

    if (!mongoose.Types.ObjectId.isValid(trackId) || new mongoose.Types.ObjectId(trackId).toString() !== trackId) throw new BadRequestException();

    if (!evaluation) {
      await this.requestService.updateManyRequests({ track: trackId }, { status: "REJECTED" });
      return;
    }

    this.requestService.finalizeRequest(trackId);
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
  async getPersonalRequests(@Req() req: FastifyRequest) {
    console.log(req.user);
    return await this.requestService.getPersonalRequests(req.user._id.toString());
  }
}
