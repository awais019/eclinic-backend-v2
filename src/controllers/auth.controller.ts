import { Request, Response } from "express";
import prisma from "../prisma";
import { JwtPayload } from "jsonwebtoken";
import constants from "../constants";
import jwtHelpers from "../helpers/jwt";
import APIHelpers from "../helpers";

export default {
  verifyEmail: async function (req: Request, res: Response) {
    const { token } = req.body;
    try {
      jwtHelpers.verify(token);
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid token."),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.email_verified) {
      APIHelpers.sendAPIError(res, new Error("Email already verified."));
    }

    await prisma.user.update({
      where: { id: _id },
      data: { email_verified: true },
    });
    APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      "Email verified."
    );
  },
};
