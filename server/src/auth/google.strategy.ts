import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { Injectable } from "@nestjs/common";
import { UsersService } from "../users/users.service";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";

interface RawGoogleProfile {
  name: {
    familyName: string;
    givenName: string;
  };
  emails: {
    value: string;
  }[];
  photos: {
    value: string;
  }[];
}

class MyStrategy extends Strategy {
  constructor(options: any, verify: any) {
    options.authorizationURL = "https://accounts.google.com/o/oauth2/v2/auth?prompt=select_account+consent";
    super(options, verify);
  }
}

@Injectable()
export class GoogleStrategy extends PassportStrategy(MyStrategy, "google") {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: process.env.NODE_ENV === "production" ? process.env.GOOGLE_CALLBACK : "http://localhost:3000/api/auth/google-redirect",
      scope: ["email", "profile"],
    });
  }

  async validate(accessToken: string, refreshToken: string, profile: RawGoogleProfile, done: VerifyCallback): Promise<void> {
    const { name, emails, photos } = profile;

    const userData = {
      email: emails[0].value,
      firstName: name.givenName,
      lastName: name.familyName,
      picture: photos[0].value,
      accessToken,
      refreshToken,
    };

    if (!userData.email.endsWith("@hwdsb.on.ca")) throw new DomainEmailInvalidException();

    const user = await this.usersService.getOrCreateOne(userData.email, false, {
      email: userData.email,
      avatar: userData.picture,
      name: `${userData.firstName} ${userData.lastName}`,
    });

    return done(null, user);
  }
}
