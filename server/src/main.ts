import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import downloader from "./downloader/downloader";

import mongoose from "mongoose";

import * as cookieParser from "cookie-parser";

async function bootstrap() {
  if (!process.env.MONGODB_URI && process.env.NODE_ENV === "production") throw new Error("NO DATABASE CONNECTION URI PROVIDED!");

  await downloader.initialize();

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
  await mongoose.connect(process.env.MONGODB_URI, {});

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
