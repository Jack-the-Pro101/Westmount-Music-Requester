import { PassportSerializer } from "@nestjs/passport";

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: any, done: Function) {
    done(null, user);
  }

  deserializeUser(payload: any, done: Function) {
    done(null, payload);
  }
}
