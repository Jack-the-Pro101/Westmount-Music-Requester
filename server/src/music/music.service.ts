import { Injectable } from "@nestjs/common";
import { Hits } from "src/types";

@Injectable()
export class MusicService {
    async search(query: string) {
        try {
            const request = await fetch(`https://api.genius.com/search?q=${encodeURIComponent(query)}&access_token=${process.env.GENIUS_ACCESS_TOKEN}`);
            const response = await request.json();
            const songs = (response.response?.hits || []) as Hits;

            return songs;
        } catch (e) {
            console.error(e);
            return [];
        }
    }

    async getInfo(songId: string) {
        throw new Error("Not implemented");
    }
}
