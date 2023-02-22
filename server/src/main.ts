import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";
import downloader from "./downloader/downloader";

import { generateBitfield } from "./shared/permissions/manager";

import mongoose from "mongoose";
import Users from "./models/User";

import * as bcrypt from "bcrypt";

import * as passport from "passport";
import * as session from "express-session";
import * as connectMongodbSession from "connect-mongodb-session";
const MongoDBStore = connectMongodbSession(session);
const store = new MongoDBStore({
  uri: process.env.MONGODB_URI!,
  collection: "sessions",
});

import * as cookieParser from "cookie-parser";
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
  if (process.env.NODE_ENV === "production") {
    if (!process.env.MONGODB_URI) throw new Error("NO DATABASE CONNECTION URI PROVIDED!");
    if (!process.env.SYS_ADMIN_USERNAME || !process.env.SYS_ADMIN_PASSWORD) throw new Error("NO DEFAULT INTERNAL ADMIN CREDENTIALS PROVIDED!");
  }

  await downloader.initialize();
  await connectDatabase();
  await initTasks();

  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.use(cookieParser());
  app.use(
    session({
      store: store,
      secret: process.env.JWT_SECRET!,
      resave: false,
      saveUninitialized: false,
      name: "WMR_SID",
    })
  );
  app.use(passport.initialize());
  app.use(passport.session());

  app.useGlobalFilters(new DomainEmailInvalidExceptionFilter());

  process.env.NODE_ENV !== "production" &&
    app.enableCors({
      origin: "http://localhost:5173",
      credentials: true,
    });

  await app.listen(process.env.NODE_ENV === "production" ? 80 : 3000, "0.0.0.0");
}
bootstrap();
