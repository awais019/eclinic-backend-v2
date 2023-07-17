import { Request, Response, NextFunction } from "express";
import constants from "../constants";
import helpers from "../helpers";
import errorLogger from "../startup/logger";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
) {
  errorLogger.error(err.message, err);
  return helpers.sendAPIError(
    res,
    new Error("Something failed..."),
    constants.INTERNAL_SERVER_ERROR_CODE
  );
}
