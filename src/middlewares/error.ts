import { Request, Response, NextFunction } from "express";
import constants from "../constants";
import errorLogger from "../startup/logger";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  errorLogger.error(err.message, err);
  res.status(constants.INTERNAL_SERVER_ERROR_CODE).send("Something failed...");
}
