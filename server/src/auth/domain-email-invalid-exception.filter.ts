import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";

@Catch(DomainEmailInvalidException)
export class DomainEmailInvalidExceptionFilter implements ExceptionFilter {
  catch(exception: DomainEmailInvalidException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: Response = ctx.getResponse();

    response.redirect(process.env.NODE_ENV! === "production" ? `${process.env.ROOT_DOMAIN!}/error?code=auth` : "http://localhost:5173/error?code=auth");
  }
}
