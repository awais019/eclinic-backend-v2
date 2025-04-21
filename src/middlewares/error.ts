import { Request, Response, NextFunction } from "express";
import constants from "../constants";
import helpers from "../helpers";
import errorLogger from "../startup/logger";

export default function (
  err: Error,
  req: Request,
  res: Response,
  next: NextFunction
): void {
  errorLogger.error(err.message, err);
  helpers.sendAPIError(
    res,
    new Error(constants.INTERNAL_SERVER_ERROR_MSG),
    constants.INTERNAL_SERVER_ERROR_CODE
  );
}
