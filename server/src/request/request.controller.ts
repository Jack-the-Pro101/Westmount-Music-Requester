import { Body, Controller, Post } from "@nestjs/common";
import { RequestData } from "src/types";

@Controller("/api/requests")
export class RequestController {
  constructor() {}

  @Post()
  async createReq(@Body() info: RequestData) {
    const { geniusId, youtubeId, playRange } = info;
  }
}
