import { Body, Controller, Post, Req, Res } from "@nestjs/common";
import { Response } from "express";
import { RequestData } from "src/types";

import { validateAllParams } from "src/utils";

import { RequestService } from "./request.service";

@Controller("/api/requests")
export class RequestController {
  constructor(private readonly requestService: RequestService) {}

  @Post()
  async createReq(@Body() info: RequestData, @Req() req, @Res() res: Response) {
    const { youtubeId, playRange } = info;

    if (!validateAllParams([youtubeId, playRange])) return res.sendStatus(400);

    const scanResult = await this.requestService.scanLyrics(youtubeId);

    return scanResult;
  }
}
