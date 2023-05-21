import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";
import { FastifyReply } from "fastify";

@Catch(DomainEmailInvalidException)
export class DomainEmailInvalidExceptionFilter implements ExceptionFilter {
  catch(exception: DomainEmailInvalidException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response: FastifyReply = ctx.getResponse();

    response.redirect(process.env.NODE_ENV! === "production" ? `${process.env.ROOT_DOMAIN!}/error?code=auth` : "http://localhost:5173/error?code=auth");
  }
}
