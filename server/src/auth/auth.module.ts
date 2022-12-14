import { GoogleStrategy } from "./google.strategy";
import { Module } from "@nestjs/common";
import { AuthController } from "./auth.controller";
import { AuthService } from "./auth.service";
import { UsersModule } from "../users/users.module";
import { LocalStrategy } from "./local.strategy";
import { PassportModule } from "@nestjs/passport";
import { SessionSerializer } from "./session.serializer";

@Module({
  imports: [UsersModule, PassportModule, PassportModule.register({ session: true })],
  controllers: [AuthController],
  providers: [AuthService, GoogleStrategy, LocalStrategy, SessionSerializer],
})
export class AuthModule {}
