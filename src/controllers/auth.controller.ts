import { Request, Response } from "express";
import prisma from "../prisma";
import { JwtPayload } from "jsonwebtoken";
import constants from "../constants";
import jwtHelpers from "../helpers/jwt";
import APIHelpers from "../helpers";
import ejsHelpers from "../helpers/ejs";
import emailHelpers from "../helpers/email";

export default {
  verifyEmail: async function (req: Request, res: Response) {
    const { token } = req.body;
    try {
      jwtHelpers.verify(token);
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.email_verified) {
      return APIHelpers.sendAPISuccess(
        res,
        null,
        constants.SUCCESS_CODE,
        constants.EMAIL_ALREADY_VERIFIED
      );
    }

    console.log(user);
    await prisma.user.update({
      where: { id: _id },
      data: { email_verified: true },
    });
    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.EMAIL_VERIFIED
    );
  },
  requestNewEmailVerification: async function (req: Request, res: Response) {
    const { token } = req.body;
    try {
      jwtHelpers.verify(token, {
        ignoreExpiration: true,
      });
    } catch (error) {
      return APIHelpers.sendAPIError(
        res,
        new Error(constants.INVALID_TOKEN),
        constants.BAD_REQUEST_CODE
      );
    }

    const { _id } = jwtHelpers.decode(token) as JwtPayload;

    const user = await prisma.user.findUnique({
      where: { id: _id },
    });

    if (user.email_verified) {
      return APIHelpers.sendAPISuccess(
        res,
        null,
        constants.SUCCESS_CODE,
        constants.EMAIL_ALREADY_VERIFIED
      );
    }

    const newToken = jwtHelpers.sign({ _id, email: user.email });

    const html = await ejsHelpers.renderHTMLFile("email", {
      name: user.first_name,
      link: `${process.env.CLIENT_URL}/?token=${newToken}`,
    });

    await emailHelpers.sendMail(
      user.email,
      "Welcome to Eclinic",
      null,
      null,
      html
    );

    return APIHelpers.sendAPISuccess(
      res,
      null,
      constants.SUCCESS_CODE,
      constants.VERIFICATION_EMAIL_SENT
    );
  },
  signin: async function (req: Request, res: Response) {
    const { email, password } = req.body;

    const user = await prisma.user.findUnique({ where: { email } });

    if (!user) {
      return APIHelpers.sendAPIError(
        res,
        new Error("Invalid credentials."),
        constants.UNAUTHORIZED_CODE
      );
    }

    return APIHelpers.sendAPISuccess(res, null, constants.SUCCESS_CODE);
  },
};
