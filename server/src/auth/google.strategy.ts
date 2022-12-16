import { PassportStrategy } from "@nestjs/passport";
import { Strategy, VerifyCallback } from "passport-google-oauth2";
import { Injectable } from "@nestjs/common";
import { UsersService } from "./users.service";

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

@Injectable()
export class GoogleStrategy extends PassportStrategy(Strategy, "google") {
  constructor(private readonly usersService: UsersService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:3000/api/auth/google-redirect",
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

    if (!userData.email.endsWith("@hwdsb.on.ca")) return done(true, null, { message: "domainEmailInvalid" });

    const user = await this.usersService.getOrCreateOne(userData.email, false, {
      email: userData.email,
      avatar: userData.picture,
      name: `${userData.firstName} ${userData.lastName}`,
    });

    return done(null, user);
  }
}
