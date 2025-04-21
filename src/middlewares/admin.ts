import { Request, Response, NextFunction } from "express";
import constants from "../constants";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

export default function () {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.header(constants.AUTH_HEADER_NAME);

    if (!token) {
      helpers.sendAPIError(
        res,
        new Error(constants.AUTH_REQUIRED),
        constants.UNAUTHORIZED_CODE
      );
    }
    try {
      const { role } = jwtHelpers.verify(token) as JwtPayload;
      if (role == "ADMIN") {
        next();
      } else {
        helpers.sendAPIError(
          res,
          new Error(constants.AUTH_REQUIRED),
          constants.UNAUTHORIZED_CODE
        );
      }
    } catch (error) {
      helpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }
  };
}
