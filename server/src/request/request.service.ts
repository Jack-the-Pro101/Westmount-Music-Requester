import { Injectable } from "@nestjs/common";

import trackSchema from "../models/Track";

import { google } from "googleapis";
import downloader from "src/downloader/downloader";

import * as profaneWords from "./profanity_words.json";

@Injectable()
export class RequestService {
  constructor() {}

  async scanLyrics(youtubeId: string) {
    try {
      const existingTrack = await trackSchema.findOne({ youtubeId });

      if (existingTrack && existingTrack.explicit) return false;

      const lyrics = await downloader.getLyrics(youtubeId);

      if (!lyrics) return true;

      const possibleProfaneLines = [];

      for (let i = 0, n = profaneWords.length; i < n; ++i) {
        const word = profaneWords[i].toLowerCase();
        const matches = lyrics.matchAll(new RegExp(`^.*${word}.*$`, "gim"));

        for (const match of matches) {
          const line = match[0];

          if (!possibleProfaneLines.includes(line)) possibleProfaneLines.push(line);

          break;
        }
      }

      const DISCOVERY_URL = "https://commentanalyzer.googleapis.com/$discovery/rest?version=v1alpha1";
      const client = await google.discoverAPI(DISCOVERY_URL);

      for (let i = 0, n = possibleProfaneLines.length; i < n; ++i) {
        const line = possibleProfaneLines[i];

        const analysisData = {
          comment: {
            text: line,
          },
          requestedAttributes: {
            TOXICITY: {},
            PROFANITY: {},
          },
        };

        const isProfane = await new Promise((resolve, reject) => {
          // @ts-expect-error
          client.comments.analyze({ key: process.env.PERSPECTIVE_API_KEY, resource: analysisData }, (err, response) => {
            if (err) {
              console.error(err);
              return reject(err);
            }

            console.log(response.data.attributeScores.TOXICITY.summaryScore.value);
            console.log(response.data.attributeScores.PROFANITY.summaryScore.value);

            if (response.data.attributeScores.TOXICITY.summaryScore.value > 0.7 || response.data.attributeScores.PROFANITY.summaryScore.value > 0.7) {
              return resolve(true);
            }
            resolve(false);
          });
        });

        if (isProfane) {
          return false;
        }
      }

      return true;
    } catch (err) {
      console.error(err);
    }
  }
}
