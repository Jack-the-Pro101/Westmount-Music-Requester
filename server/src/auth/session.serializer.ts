import { PassportSerializer } from "@nestjs/passport";

export class SessionSerializer extends PassportSerializer {
  serializeUser(user: unknown, done: Function) {
    done(null, user);
  }

  deserializeUser(payload: unknown, done: Function) {
    done(null, payload);
  }
}
