import { GrantSession } from "grant";
import { StoredUser, WithId } from "./types";

import { FastifyRequest, FastifyReply } from "fastify";

declare module "fastify" {
  interface FastifyRequest {
    user: WithId<StoredUser>;
  }
} // query
