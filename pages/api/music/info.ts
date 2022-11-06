import { NextApiRequest, NextApiResponse } from "next";

import ytdlpPath from "../../../lib/yt-dlp/ytdlp";

export default function handler(req: NextApiRequest, res: NextApiResponse) {
  const { songId } = req.query;

  if (songId == null) return res.status(400);
}
