import { RequestService } from "./request.service";
import { MusicService } from "../music/music.service";
import requestSchema from "../models/Request";

class Recover {
  private requestService: RequestService;

  constructor() {
    this.requestService = new RequestService(new MusicService());
  }

  async recoverScans() {
    const requests = await requestSchema
      .find({
        status: "AWAITING",
      })
      .populate("track");

    for (let i = 0, n = requests.length; i < n; ++i) {
      const request = requests[i];

      // @ts-expect-error
      await this.requestService.evaluateRequest(request.track.youtubeId, request.track._id);
    }
  }
}

export default new Recover();
