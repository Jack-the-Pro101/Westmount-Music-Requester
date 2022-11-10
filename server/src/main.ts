import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";

import downloader from "./downloader/downloader";

async function bootstrap() {
  downloader;

  const app = await NestFactory.create(AppModule);
  await app.listen(3000);
}
bootstrap();
