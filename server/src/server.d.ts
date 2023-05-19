import { GrantSession } from "grant";
import { GoogleUser, StoredUser } from "./types";

import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: StoredUser;
  }
  interface FastifyReply {
    grant: GrantSession;
  }
}

