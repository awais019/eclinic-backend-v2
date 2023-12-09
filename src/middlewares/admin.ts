import { Request, Response, NextFunction } from "express";
import constants from "../constants";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";
import { ROLE } from "@prisma/client";

export default function () {
  return function (req: Request, res: Response, next: NextFunction) {
    const token = req.header(constants.AUTH_HEADER_NAME);
    if (!token) {
      return helpers.sendAPIError(
        res,
        new Error(constants.AUTH_REQUIRED),
        constants.UNAUTHORIZED_CODE
      );
    }
    const { role } = jwtHelpers.verify(token) as JwtPayload;
    if (role != ROLE.ADMIN) {
      return helpers.sendAPIError(
        res,
        new Error(constants.AUTH_REQUIRED),
        constants.UNAUTHORIZED_CODE
      );
    } else {
      next();
    }

    return helpers.sendAPIError(
      res,
      new Error(constants.INVALID_TOKEN),
      constants.BAD_REQUEST_CODE
    );
  };
}
