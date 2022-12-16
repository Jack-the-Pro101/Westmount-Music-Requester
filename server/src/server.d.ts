import { Request } from "express";
import { GoogleUser, StoredUser } from "./types";

export interface StoredAuthenticatedRequest extends Request {
  user: StoredUser;
}

export interface GoogleAuthenticatedRequest extends Request {
  user: GoogleUser;
}
