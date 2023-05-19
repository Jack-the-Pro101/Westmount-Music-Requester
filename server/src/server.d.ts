import { GrantSession } from "grant";
import { GoogleUser, StoredUser } from "./types";

import { FastifyRequest } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: StoredUser;
    session: {
      grant: GrantSession
    }
  }
}

