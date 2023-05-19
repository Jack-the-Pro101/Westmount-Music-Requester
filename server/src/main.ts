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
  // mongoose.set("toJSON", {
  //   transform: (doc, converted) => {
  //     delete converted.__v;

  //     const { _id, id } = converted;

  //     if (_id && !id) {
  //       converted.id = _id.toString();
  //       delete converted._id;
  //     }
  //   }
  // });
  // mongoose.Schema.prototype.pre("")
  await mongoose.connect(process.env.MONGODB_URI!, {});
}

async function initTasks() {
  const user = await Users.findOne({ username: process.env.SYS_ADMIN_USERNAME });

  if (user == null) {
    await Users.create({
      username: process.env.SYS_ADMIN_USERNAME,
      password: await bcrypt.hash(process.env.SYS_ADMIN_PASSWORD!, 10),
      type: "INTERNAL",
      permissions: generateBitfield("EVERYTHING"),
      name: "Administrator",
    });
  }
}

async function bootstrap() {
  console.log("Running in", process.env.NODE_ENV === "production" ? "production" : "dev environment");

  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) throw new Error("NO DATABASE CONNECTION URI PROVIDED!");
    if (!process.env.SYS_ADMIN_USERNAME || !process.env.SYS_ADMIN_PASSWORD) throw new Error("NO DEFAULT INTERNAL ADMIN CREDENTIALS PROVIDED!");
  }

  await downloader.initialize();
  await connectDatabase();
  await initTasks();

  const app = await NestFactory.create<NestFastifyApplication>(AppModule, new FastifyAdapter());
  app.register(fastifyCookie, {
    secret: process.env.JWT_SECRET!,
  });
  // app.register(grant.fastify({
  //   defaults: {
  //     origin: "http://localhost:3000",
  //     transport: "state"
  //   },
  //   google: {
  //     key: process.env.GOOGLE_CLIENT_ID,
  //     secret: process.env.GOOGLE_CLIENT_SECRET,
  //     callback: process.env.NODE_ENV === "production" ? process.env.GOOGLE_CALLBACK : "http://localhost:3000/api/auth/google-redirect",
  //     scope: ["email", "profile"]
  //   }
  // }))

  app.useGlobalFilters(new DomainEmailInvalidExceptionFilter());

  process.env.NODE_ENV !== "production" &&
    app.enableCors({
      origin: "http://localhost:5173",
      credentials: true,
    });

  await app.listen(process.env.BIND_PORT || 3000, process.env.BIND_INTERFACE!);
}
bootstrap();
