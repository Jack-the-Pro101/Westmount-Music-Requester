import { BadRequestException, Injectable, UnauthorizedException } from "@nestjs/common";
import { StoredUser, WithId } from "../types";
import { UsersService } from "../users/users.service";
import * as bcrypt from "bcrypt";
import { FastifyRequest } from "fastify";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";
import { sign, verify } from "jsonwebtoken";

interface GoogleRawProfile {
  sub: string;
  name: string;
  given_name: string;
  family_name: string;
  picture: string;
  email: string;
  email_verified: boolean;
  locale: string;
}

@Injectable()
export class AuthService {
  constructor(private usersService: UsersService) {}

  async googleLogin(req: FastifyRequest): Promise<StoredUser | undefined> {
    const code = Object.getOwnPropertyDescriptor(req.query, "code")?.value;
    const stateToken = Object.getOwnPropertyDescriptor(req.query, "state")?.value;
    if (!code || !stateToken || typeof code !== "string" || typeof stateToken !== "string") throw new BadRequestException();
    try {
      const result = verify(stateToken, process.env.JWT_SECRET!) as {
        expires: number;
      };
      if (Date.now() > result.expires) throw new BadRequestException();
    } catch {
      throw new BadRequestException();
    }
    const token = await this.getAccessToken(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.GOOGLE_CLIENT_SECRET!,
      code,
      process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : "http://localhost:3000/api/auth/google-redirect"
    );
    console.log(code, stateToken);
    if (!token) throw new UnauthorizedException();
    const rawUser = await this.getUserProfile(token);
    console.log(rawUser);
    if (!rawUser) return;

    const user: StoredUser = {
      type: "GOOGLE",
      email: rawUser.email,
      avatar: rawUser.picture,
      name: rawUser.name,
      permissions: 2,
    };
    // if (!user.email.endsWith("@hwdsb.on.ca")) throw new DomainEmailInvalidException();

    const storedUser = await this.usersService.createOrUpdateOne(user);
    return storedUser as StoredUser;
  }

  async validateUser(username: string, password: string): Promise<WithId<StoredUser> | undefined> {
    const user = await this.usersService.findOne(username, true);

    if (!user || user.type !== "INTERNAL") return;
    if (!(await bcrypt.compare(password, user.password!))) return;
    return user;
  }

  getOauthUrl(clientId: string, redirectUri: string, scopes: string[], state: string) {
    const base = new URL("https://accounts.google.com/o/oauth2/v2/auth");
    base.searchParams.set("client_id", clientId);
    base.searchParams.set("redirect_uri", redirectUri);
    base.searchParams.set("scope", scopes.join(" "));
    base.searchParams.set("state", state);
    base.searchParams.set("access_type", "offline");
    base.searchParams.set("prompt", ["select_account", "consent"].join(" "));
    base.searchParams.set("response_type", "code");
    return base.toString();
  }

  // Gets an OAuth url from current env and parameters.
  getCurrentOauthUrl() {
    const token = sign({ expires: Date.now() + 3600000 }, process.env.JWT_SECRET!);
    return this.getOauthUrl(
      process.env.GOOGLE_CLIENT_ID!,
      process.env.NODE_ENV === "production" ? process.env.GOOGLE_REDIRECT_URI! : "http://localhost:3000/api/auth/google-redirect",
      ["email", "profile"],
      token
    );
  }

  async getAccessToken(clientId: string, clientSecret: string, code: string, redirectUri: string): Promise<string | undefined> {
    try {
      const response = await fetch("https://oauth2.googleapis.com/token", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          client_id: clientId,
          client_secret: clientSecret,
          code: code,
          redirect_uri: redirectUri,
          grant_type: "authorization_code",
        }),
      });
      const json = await response.json();

      return json.access_token as string;
    } catch {}
  }

  async getUserProfile(accessToken: string): Promise<GoogleRawProfile | undefined> {
    try {
      const response = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const json: GoogleRawProfile = await response.json();
      return json;
    } catch {}
  }
}
