import { ArgumentsHost, Catch, ExceptionFilter } from "@nestjs/common";
import { Response } from "express";
import { DomainEmailInvalidException } from "./domain-email-invalid.exception";

@Catch(DomainEmailInvalidException)
export class DomainEmailInvalidExceptionFilter implements ExceptionFilter {
    catch(exception: DomainEmailInvalidException, host: ArgumentsHost) {
        const ctx = host.switchToHttp();
        const response: Response = ctx.getResponse();
        
        response.redirect("/error?code=domainEmailInvalid");
    }
}