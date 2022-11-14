import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import downloader from "./downloader/downloader";

import * as cookieParser from "cookie-parser";

async function bootstrap() {
  await downloader.initialize();

  const app = await NestFactory.create(AppModule);
  app.use(cookieParser());

  await app.listen(3000);
}
bootstrap();
