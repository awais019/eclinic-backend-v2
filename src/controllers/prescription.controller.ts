import { Request, Response } from "express";
import constants from "../constants";
import prisma from "../prisma";
import helpers from "../helpers";
import jwtHelpers from "../helpers/jwt";
import { JwtPayload } from "jsonwebtoken";

export default {
  create: async (req: Request, res: Response) => {
    const token = req.header(constants.AUTH_HEADER_NAME);

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const doctor = await prisma.doctor.findUnique({
      where: {
        userId: _id,
      },
    });

    if (!doctor) {
      return helpers.sendAPIError(
        res,
        new Error(constants.UNAUTHORIZED_MSG),
        constants.UNAUTHORIZED_CODE
      );
    }
  },
};
