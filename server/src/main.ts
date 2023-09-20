import { NestFactory } from "@nestjs/core";
import { FastifyAdapter, NestFastifyApplication } from "@nestjs/platform-fastify";
import { AppModule } from "./app.module";
import downloader from "./downloader/downloader";

import { generateBitfield } from "./shared/permissions/manager";

import mongoose from "mongoose";
import Users from "./models/User";

import * as bcrypt from "bcrypt";

import fastifyCookie from "@fastify/cookie";

import { DomainEmailInvalidExceptionFilter } from "./auth/domain-email-invalid-exception.filter";
import { validateAllParams } from "./utils";
import Recover from "./request/recover";

process.on("unhandledRejection", (reason, promise) => {
  console.error("Critical error encountered at:", promise, "Reason:", reason);
});

async function connectDatabase() {
  const connection = mongoose.connection;
  connection.on("error", (error) => {
    console.error("FATAL ERROR: FAILED TO CONNECT TO MONGODB DATABASE! APPLICATION CANNOT CONTINUE.");
    throw error;
  });
  connection.on("disconnected", () => console.log("Disconnected from MongoDB database"));
  connection.once("open", () => {
    console.log("Connected to MongoDB database");
    connection.on("open", () => console.log("Reconnected to MongoDB database"));
  });
  connection.on("connection", () => console.log("Connection established"));
  await mongoose.connect(process.env.MONGODB_URI!, {});
}

async function initTasks() {
  const user = await Users.findOne({
    username: process.env.SYS_ADMIN_USERNAME,
  });

  if (user == null) {
    await Users.create({
      username: process.env.SYS_ADMIN_USERNAME,
      password: await bcrypt.hash(process.env.SYS_ADMIN_PASSWORD!, 10),
      type: "INTERNAL",
      permissions: generateBitfield("EVERYTHING"),
      name: "Administrator",
    });
  }

  Recover.recoverScans();
}

async function bootstrap() {
  console.log("Running in", process.env.NODE_ENV === "production" ? "production" : "development");

  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) throw new Error("NO DATABASE CONNECTION URI PROVIDED!");
    if (!process.env.SYS_ADMIN_USERNAME || !process.env.SYS_ADMIN_PASSWORD) throw new Error("NO DEFAULT INTERNAL ADMIN CREDENTIALS PROVIDED!");
    if (
      !validateAllParams([
        process.env.GOOGLE_CLIENT_ID,
        process.env.GOOGLE_CLIENT_SECRET,
        process.env.SPOTIFY_CLIENT_ID,
        process.env.SPOTIFY_CLIENT_SECRET,
        process.env.PERSPECTIVE_API_KEY,
      ])
    )
      throw new Error("WARNING: Not all application IDs/secrets were provided in env vars. Application will not function correctly.");
  }

  await downloader.initialize();
  await connectDatabase();
  await initTasks();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET!,
  });

  app.useGlobalFilters(new DomainEmailInvalidExceptionFilter());

  process.env.NODE_ENV !== "production" &&
    app.enableCors({
      origin: "http://localhost:5173",
      credentials: true,
    });

  await app.listen(process.env.BIND_PORT || 3000, process.env.BIND_INTERFACE!);
}

bootstrap();
