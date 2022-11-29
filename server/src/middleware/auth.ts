import { Request, Response, NextFunction } from "express";
import { verify } from "jsonwebtoken";

export function AuthSupplier(req: Request, res: Response, next: NextFunction) {
  // if (req.cookies["auth_token"]) {
  //   try {
  //     const user = verify(req.cookies["auth_token"], process.env.JWT_SECRET);

  //     (req as any).user = user;
  //   } catch {
  //     (req as any).user = null;
  //   }
  // } else {
  //   (req as any).user = null;
  // }

  console.log(req.user);

  next();
}
