import { Request, Response, NextFunction } from "express";
import errorLogger from "../startup/logger";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  errorLogger.error(err.message, err);
  res.status(500).send("Something failed.");
}
